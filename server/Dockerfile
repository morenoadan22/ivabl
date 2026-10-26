# Build context is the repo root (see fly.toml [build]).
FROM node:22-bookworm-slim
WORKDIR /app
# better-sqlite3 compiles a native module at install time
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
COPY server/package.json server/package-lock.json* ./server/
RUN npm install --omit=dev --prefix ./server
COPY server/*.js ./server/
COPY scripts/ ./scripts/
COPY src/data/ ./src/data/
COPY public/stats.csv ./public/stats.csv
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "server/index.js"]
