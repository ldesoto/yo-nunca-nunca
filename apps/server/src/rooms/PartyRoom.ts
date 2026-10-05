import { Room, Client } from '@colyseus/core';
import type { DbQuestion } from '@ynn/db';
import { fetchActiveQuestions } from '@ynn/db';
import {
  DEFAULT_ROOM_SETTINGS,
  canStartGame,
  canTransition,
  generateRoomCode,
  isValidPlayerName,
  nextAfterScore,
  normalizeRoomCode,
  sanitizePlayerName,
  scoreRound,
  type AnswerChoice,
  type RoundAnswer,
} from '@ynn/shared';
import type pg from 'pg';
import { GameState, PlayerState } from '../schema/GameState.js';
import { pickFallback } from '../questions.js';

export type PartyRoomOptions = {
  roomCode?: string;
  playerName?: string;
  rounds?: number;
  categories?: string[];
  pool?: pg.Pool | null;
  solo?: boolean;
};

type PrivateAnswer = { choice: AnswerChoice };

export class PartyRoom extends Room<GameState> {
  maxClients = DEFAULT_ROOM_SETTINGS.maxPlayers;
  private pool: pg.Pool | null = null;
  private solo = false;
  private answers = new Map<string, PrivateAnswer>();
  private deck: DbQuestion[] = [];
  private usedQuestionIds = new Set<string>();
  private answerTimer: ReturnType<typeof setTimeout> | null = null;
  private revealTimer: ReturnType<typeof setTimeout> | null = null;
  private scoreTimer: ReturnType<typeof setTimeout> | null = null;
  private createHits: number[] = [];

  onCreate(options: PartyRoomOptions = {}) {
    this.pool = options.pool ?? null;
    this.solo = Boolean(options.solo);
    this.setState(new GameState());
    this.state.roomCode = normalizeRoomCode(
      options.roomCode || generateRoomCode(),
    );
    this.state.totalRounds = Math.min(
      30,
      Math.max(3, options.rounds ?? DEFAULT_ROOM_SETTINGS.rounds),
    );
    const cats = options.categories?.length
      ? options.categories
      : ['todas'];
    for (const c of cats) this.state.categories.push(c);

    this.setMetadata({ roomCode: this.state.roomCode });
    this.autoDispose = true;
    this.patchRate = 50;

    this.onMessage('setName', (client, message: { name?: string }) => {
      this.handleSetName(client, message?.name ?? '');
    });
    this.onMessage('setReady', (client, message: { ready?: boolean }) => {
      this.handleSetReady(client, Boolean(message?.ready));
    });
    this.onMessage('startGame', (client) => {
      void this.handleStartGame(client);
    });
    this.onMessage('submitAnswer', (client, message: { choice?: string }) => {
      this.handleSubmitAnswer(client, message?.choice);
    });
    this.onMessage('ackReveal', (client) => {
      this.handleAckReveal(client);
    });
    this.onMessage('setCategories', (client, message: { categories?: string[] }) => {
      this.handleSetCategories(client, message?.categories ?? []);
    });
    this.onMessage('setRounds', (client, message: { rounds?: number }) => {
      this.handleSetRounds(client, message?.rounds);
    });
  }

  onJoin(client: Client, options: PartyRoomOptions = {}) {
    if (this.state.phase !== 'LOBBY') {
      throw new Error('La partida ya comenzó');
    }
    if (this.state.players.size >= this.maxClients) {
      throw new Error('Sala llena');
    }

    const now = Date.now();
    this.createHits = this.createHits.filter((t) => now - t < 10_000);
    this.createHits.push(now);
    if (this.createHits.length > 40) {
      throw new Error('Demasiadas solicitudes');
    }

    const player = new PlayerState();
    player.sessionId = client.sessionId;
    player.name = sanitizePlayerName(options.playerName || 'Jugador');
    if (!isValidPlayerName(player.name)) {
      player.name = 'Jugador';
    }
    player.connected = true;
    player.isHost = this.state.players.size === 0;
    if (player.isHost) {
      this.state.hostSessionId = client.sessionId;
    }
    this.state.players.set(client.sessionId, player);
  }

  async onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    player.connected = false;
    try {
      if (!consented) {
        await this.allowReconnection(client, 60);
        player.connected = true;
        return;
      }
    } catch {
      // reconnection window expired
    }

    this.state.players.delete(client.sessionId);
    this.answers.delete(client.sessionId);

    if (this.state.hostSessionId === client.sessionId) {
      const next = [...this.state.players.values()].find((p) => p.connected);
      if (next) {
        next.isHost = true;
        this.state.hostSessionId = next.sessionId;
      } else {
        this.state.hostSessionId = '';
      }
    }

    if (
      this.state.phase === 'WAITING_FOR_ANSWERS' ||
      this.state.phase === 'QUESTION'
    ) {
      this.maybeCloseAnswers();
    }
  }

  onDispose() {
    this.clearTimers();
  }

  private handleSetName(client: Client, name: string) {
    if (this.state.phase !== 'LOBBY') return;
    const player = this.state.players.get(client.sessionId);
    if (!player) return;
    const cleaned = sanitizePlayerName(name);
    if (!isValidPlayerName(cleaned)) return;
    player.name = cleaned;
  }

  private handleSetReady(client: Client, ready: boolean) {
    if (this.state.phase !== 'LOBBY') return;
    const player = this.state.players.get(client.sessionId);
    if (!player) return;
    player.ready = ready;
  }

  private handleSetCategories(client: Client, categories: string[]) {
    if (this.state.phase !== 'LOBBY') return;
    if (client.sessionId !== this.state.hostSessionId) return;
    this.state.categories.clear();
    const cleaned = categories.length ? categories : ['todas'];
    for (const c of cleaned.slice(0, 8)) this.state.categories.push(String(c));
  }

  private handleSetRounds(client: Client, rounds?: number) {
    if (this.state.phase !== 'LOBBY') return;
    if (client.sessionId !== this.state.hostSessionId) return;
    if (typeof rounds !== 'number' || Number.isNaN(rounds)) return;
    this.state.totalRounds = Math.min(30, Math.max(3, Math.floor(rounds)));
  }

  private async handleStartGame(client: Client) {
    if (client.sessionId !== this.state.hostSessionId) return;
    if (this.state.phase !== 'LOBBY') return;
    if (!this.solo && !canStartGame(this.state.players.size)) return;
    if (this.solo && this.state.players.size < 1) return;
    if (!canTransition('LOBBY', 'QUESTION')) return;

    await this.loadDeck();
    this.state.currentRound = 0;
    this.beginQuestion();
  }

  private async loadDeck() {
    const cats = [...this.state.categories];
    const need = this.state.totalRounds + 5;
    this.usedQuestionIds.clear();
    try {
      if (this.pool) {
        this.deck = await fetchActiveQuestions(this.pool, cats, need);
      } else {
        this.deck = [];
      }
    } catch {
      this.deck = [];
    }
    if (this.deck.length < this.state.totalRounds) {
      const extra = pickFallback(cats, need, this.usedQuestionIds);
      this.deck = [...this.deck, ...extra];
    }
  }

  private beginQuestion() {
    this.clearTimers();
    this.answers.clear();
    this.state.revealedYesNames.clear();
    this.state.yesCount = 0;
    this.state.totalAnswered = 0;
    this.state.specialEvent = 'none';
    this.state.currentRound += 1;

    for (const p of this.state.players.values()) {
      p.hasAnswered = false;
    }

    const q =
      this.deck.find((item) => !this.usedQuestionIds.has(item.id)) ||
      pickFallback([...this.state.categories], 1, this.usedQuestionIds)[0];

    if (!q) {
      this.state.phase = 'GAME_OVER';
      this.computeWinner();
      return;
    }

    this.usedQuestionIds.add(q.id);
    this.state.questionId = q.id;
    this.state.questionText = q.text;
    this.state.phase = 'QUESTION';
    this.state.answerDeadlineAt =
      Date.now() + DEFAULT_ROOM_SETTINGS.answerTimeoutMs;

    // Move immediately to waiting — clients show the question either way
    this.state.phase = 'WAITING_FOR_ANSWERS';
    this.answerTimer = setTimeout(() => {
      this.closeAnswers();
    }, DEFAULT_ROOM_SETTINGS.answerTimeoutMs);
  }

  private handleSubmitAnswer(client: Client, choice?: string) {
    if (this.state.phase !== 'WAITING_FOR_ANSWERS') return;
    if (choice !== 'never' && choice !== 'did') return;
    const player = this.state.players.get(client.sessionId);
    if (!player || !player.connected) return;
    if (this.answers.has(client.sessionId)) return;

    this.answers.set(client.sessionId, { choice });
    player.hasAnswered = true;
    this.maybeCloseAnswers();
  }

  private maybeCloseAnswers() {
    const connected = [...this.state.players.values()].filter((p) => p.connected);
    if (connected.length === 0) return;
    const allIn = connected.every((p) => this.answers.has(p.sessionId));
    if (allIn) this.closeAnswers();
  }

  private closeAnswers() {
    if (this.state.phase !== 'WAITING_FOR_ANSWERS') return;
    this.clearTimers();

    const roundAnswers: RoundAnswer[] = [...this.answers.entries()].map(
      ([sessionId, a]) => ({ sessionId, choice: a.choice }),
    );

    // Auto-never for connected players who timed out
    for (const p of this.state.players.values()) {
      if (p.connected && !this.answers.has(p.sessionId)) {
        roundAnswers.push({ sessionId: p.sessionId, choice: 'never' });
        p.hasAnswered = true;
      }
    }

    const result = scoreRound({
      answers: roundAnswers,
      questionId: this.state.questionId,
      questionText: this.state.questionText,
    });

    for (const [sid, pts] of Object.entries(result.pointsAwarded)) {
      const player = this.state.players.get(sid);
      if (!player) continue;
      player.score += pts;
      const choice = roundAnswers.find((a) => a.sessionId === sid)?.choice;
      if (choice === 'did') {
        player.yesCount += 1;
        const isMaj = result.yesCount > result.totalAnswered / 2;
        const isMin = result.yesCount > 0 && result.yesCount < result.totalAnswered / 2;
        if (isMaj) player.majorityCount += 1;
        if (isMin) player.minorityCount += 1;
      }
    }

    this.state.yesCount = result.yesCount;
    this.state.totalAnswered = result.totalAnswered;
    this.state.specialEvent = result.specialEvent;
    this.state.phase = 'REVEAL';

    const yesNames = result.yesPlayers
      .map((sid) => this.state.players.get(sid)?.name)
      .filter((n): n is string => Boolean(n));

    // Progressive reveal every 700ms
    let i = 0;
    const tick = () => {
      if (i < yesNames.length) {
        this.state.revealedYesNames.push(yesNames[i]!);
        i += 1;
        this.revealTimer = setTimeout(tick, 700);
      } else {
        this.revealTimer = setTimeout(() => this.goToScore(), 1200);
      }
    };
    tick();
  }

  private handleAckReveal(_client: Client) {
    // Optional early skip when all acked — Phase 1 uses timer only
  }

  private goToScore() {
    if (this.state.phase !== 'REVEAL') return;
    this.state.phase = 'SCORE';
    this.scoreTimer = setTimeout(() => {
      const next = nextAfterScore(this.state.currentRound, this.state.totalRounds);
      if (next === 'GAME_OVER') {
        this.state.phase = 'GAME_OVER';
        this.computeWinner();
      } else {
        this.beginQuestion();
      }
    }, 2500);
  }

  private computeWinner() {
    let best: PlayerState | null = null;
    for (const p of this.state.players.values()) {
      if (!best || p.score > best.score) best = p;
    }
    this.state.winnerName = best?.name ?? '';
  }

  private clearTimers() {
    if (this.answerTimer) clearTimeout(this.answerTimer);
    if (this.revealTimer) clearTimeout(this.revealTimer);
    if (this.scoreTimer) clearTimeout(this.scoreTimer);
    this.answerTimer = null;
    this.revealTimer = null;
    this.scoreTimer = null;
  }
}
