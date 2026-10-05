import { Schema, type, MapSchema, ArraySchema } from '@colyseus/schema';

export class PlayerState extends Schema {
  @type('string') sessionId: string = '';
  @type('string') name: string = 'Jugador';
  @type('boolean') ready: boolean = false;
  @type('number') score: number = 0;
  @type('boolean') connected: boolean = true;
  @type('boolean') isHost: boolean = false;
  @type('boolean') hasAnswered: boolean = false;
  @type('number') yesCount: number = 0;
  @type('number') majorityCount: number = 0;
  @type('number') minorityCount: number = 0;
}

export class GameState extends Schema {
  @type('string') roomCode: string = '';
  @type('string') phase: string = 'LOBBY';
  @type('string') hostSessionId: string = '';
  @type('number') currentRound: number = 0;
  @type('number') totalRounds: number = 12;
  @type('number') answerDeadlineAt: number = 0;
  @type('string') questionId: string = '';
  @type('string') questionText: string = '';
  @type('number') yesCount: number = 0;
  @type('number') totalAnswered: number = 0;
  @type('string') specialEvent: string = 'none';
  @type('string') activeEvent: string = 'none';
  @type('string') mode: string = 'fiesta';
  @type('string') winnerName: string = '';
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type(['string']) revealedYesNames = new ArraySchema<string>();
  @type(['string']) categories = new ArraySchema<string>();
  @type('number') customCount: number = 0;
}
