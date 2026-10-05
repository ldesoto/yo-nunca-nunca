FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json .npmrc ./
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY apps/server/package.json apps/server/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY packages/shared packages/shared
COPY packages/db packages/db
COPY apps/server apps/server
RUN pnpm --filter @ynn/shared build \
 && pnpm --filter @ynn/db build \
 && pnpm --filter @ynn/server build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS=--experimental-sqlite
ENV PORT=2567
ENV YNN_SQLITE_PATH=/data/ynn.sqlite

RUN addgroup -g 1001 -S ynn \
 && adduser -S ynn -u 1001 -G ynn \
 && mkdir -p /data \
 && chown ynn:ynn /data

COPY --from=build --chown=ynn:ynn /app /app
COPY --chown=ynn:ynn apps/server/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER ynn
WORKDIR /app/apps/server
EXPOSE 2567

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||2567)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
