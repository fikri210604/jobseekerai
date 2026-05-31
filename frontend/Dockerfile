# ============================================================
# SkillBridge AI — Frontend Dockerfile
# Target: Google Cloud Run
# Stack : Next.js 16 (App Router) + Node.js 20
# ============================================================

# ── Stage 1: deps — install node_modules ───────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files dulu (layer caching)
COPY package.json package-lock.json ./

# Install semua dependencies (termasuk devDependencies untuk build)
RUN npm ci

# ── Stage 2: builder — build Next.js ───────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy deps dari stage sebelumnya
COPY --from=deps /app/node_modules ./node_modules

# Copy seluruh source code
COPY . .

# Build argument untuk URL backend (diisi saat build time di Cloud Build)
# Ini akan menjadi nilai default jika tidak disuplai
ARG NEXT_PUBLIC_API_URL=""
ARG API_KEY=""

# Set env vars yang dibutuhkan saat build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_ENV=production

# Nonaktifkan telemetry Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js (output: .next/standalone)
RUN npm run build

# ── Stage 3: runner — image production minimal ─────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Buat user non-root untuk keamanan
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy file statis publik
COPY --from=builder /app/public ./public

# Copy hasil build Next.js (standalone mode menghasilkan bundle mandiri)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Cloud Run inject PORT via env var (default 8080)
EXPOSE 8080

ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Jalankan server Next.js standalone
CMD ["node", "server.js"]
