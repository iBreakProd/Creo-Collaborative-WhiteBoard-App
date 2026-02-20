FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/common/package.json ./packages/common/
COPY packages/ui/package.json ./packages/ui/
COPY packages/typescript-config/ ./packages/typescript-config/
COPY packages/eslint-config/ ./packages/eslint-config/

RUN pnpm install --frozen-lockfile

COPY apps/web ./apps/web
COPY packages/db ./packages/db
COPY packages/common ./packages/common
COPY packages/ui ./packages/ui

ARG NEXT_PUBLIC_HTTP_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_HTTP_URL=$NEXT_PUBLIC_HTTP_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

RUN pnpm --filter @workspace/common build && \
  pnpm --filter @workspace/db build && \
  pnpm --filter web build

FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/common/package.json ./packages/common/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile --prod

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
