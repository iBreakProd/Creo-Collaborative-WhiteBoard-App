FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/http-server/package.json ./apps/http-server/
COPY packages/db/package.json ./packages/db/
COPY packages/common/package.json ./packages/common/
COPY packages/typescript-config/ ./packages/typescript-config/
COPY packages/eslint-config/ ./packages/eslint-config/

RUN pnpm install --frozen-lockfile

COPY apps/http-server ./apps/http-server
COPY packages/db ./packages/db
COPY packages/common ./packages/common

RUN pnpm --filter @workspace/common build && \
  pnpm --filter @workspace/db build && \
  pnpm --filter http-server build

FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/http-server/package.json ./apps/http-server/
COPY packages/db/package.json ./packages/db/
COPY packages/common/package.json ./packages/common/

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/http-server/dist ./apps/http-server/dist
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/packages/common ./packages/common

ENV NODE_ENV=production
EXPOSE 4001

CMD ["node", "apps/http-server/dist/index.js"]
