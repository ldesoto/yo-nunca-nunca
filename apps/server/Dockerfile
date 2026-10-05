FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
COPY apps/server/package.json apps/server/
RUN pnpm install --frozen-lockfile=false

FROM deps AS build
COPY packages/shared packages/shared
COPY packages/db packages/db
COPY apps/server apps/server
RUN pnpm --filter @ynn/shared build \
 && pnpm --filter @ynn/db build \
 && pnpm --filter @ynn/server build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable
COPY --from=build /app /app
WORKDIR /app/apps/server
EXPOSE 2567
CMD ["node", "dist/index.js"]
