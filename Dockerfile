
# syntax=docker/dockerfile:1
FROM oven/bun:1 as base
WORKDIR /app

# Install deps (works with or without bun.lockb)
COPY package.json bun.lockb* ./
RUN if [ -f bun.lockb ]; then \
      bun install --frozen-lockfile; \
    else \
      bun install; \
    fi

# Build frontend
COPY frontend/package.json frontend/bun.lockb* ./frontend/
RUN cd frontend && bun install
COPY frontend ./frontend
RUN cd frontend && bun run build


# Copy server and compiled frontend to ./server/public
COPY server ./server
# RUN mkdir -p server/public && cp -r frontend/dist/* server/public/
# RUN mkdir -p server/public && cp -r frontend/dist/. server/public/
RUN rm -rf server/public && mkdir -p server/public && cp -r frontend/dist/. server/public/

# ----- runtime image -----
FROM oven/bun:1 as runtime
WORKDIR /app
COPY --from=base /app /app

ENV NODE_ENV=production
# Fly.io usually injects PORT; 8080 is common
EXPOSE 8080
CMD ["bun", "run", "server/index.ts"]
