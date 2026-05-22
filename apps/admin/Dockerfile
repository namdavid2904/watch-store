FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/admin/package.json ./apps/admin/
COPY packages/ui/package.json ./packages/ui/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/eslint-config/package.json ./packages/eslint-config/
RUN pnpm install --frozen-lockfile || pnpm install

FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable pnpm
COPY --from=deps /app/ ./
COPY . .
RUN pnpm --filter @watch-store/admin build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME=0.0.0.0
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public
EXPOSE 3002
CMD ["node", "apps/admin/server.js"]
