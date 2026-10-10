# Root context keeps npm workspace links; all dependencies install inside Linux.
FROM node:22-bookworm-slim AS build
WORKDIR /workspace
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/types/package.json packages/types/package.json
COPY apps/api/prisma apps/api/prisma
RUN npm ci
COPY tsconfig.json ./
COPY packages/types packages/types
COPY apps/api apps/api
RUN npx prisma generate --schema apps/api/prisma/schema.prisma \
 && npm run build --workspace=@repo/types \
 && npm run build --workspace=api

# Build the complete workspace tree, then remove dev dependencies for runtime.
# This also builds @repo/types locally, so the Docker context needs no host dist.
FROM build AS production-deps
RUN npm prune --omit=dev --workspace=api --workspace=@repo/types \
 && npx prisma generate --schema apps/api/prisma/schema.prisma \
 && mkdir -p apps/api/node_modules \
 && npm cache clean --force

FROM node:22-bookworm-slim AS runtime
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production PORT=5000
WORKDIR /workspace/apps/api
COPY --from=production-deps /workspace/node_modules /workspace/node_modules
COPY --from=production-deps /workspace/apps/api/node_modules /workspace/apps/api/node_modules
COPY --from=production-deps /workspace/packages/types /workspace/packages/types
COPY --from=production-deps /workspace/apps/api/package.json ./package.json
COPY --from=production-deps /workspace/apps/api/prisma ./prisma
COPY --from=build /workspace/apps/api/dist ./dist
COPY scripts/check-migration-mode.mjs scripts/check-schema-readiness.mjs /workspace/scripts/
RUN mkdir -p /data/public /data/private \
 && chown -R node:node /data /workspace
USER node
EXPOSE 5000
CMD ["node", "dist/index.js"]
