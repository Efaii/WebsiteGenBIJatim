# NEXT_PUBLIC_API_URL and SITE_URL are baked into the Next.js build.
# Server-only API_URL is supplied at container runtime by Compose.
FROM node:22-bookworm-slim AS build
WORKDIR /workspace
ARG NEXT_PUBLIC_API_URL=https://example.invalid/api
ARG SITE_URL=https://example.invalid
ARG NEXT_PUBLIC_NEWS_PREVIEW=0
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL SITE_URL=$SITE_URL NEXT_PUBLIC_NEWS_PREVIEW=$NEXT_PUBLIC_NEWS_PREVIEW API_URL=$NEXT_PUBLIC_API_URL
COPY package.json package-lock.json turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
COPY packages/types/package.json packages/types/package.json
RUN npm ci
COPY tsconfig.json ./
COPY packages/types packages/types
COPY apps/web apps/web
RUN npm run build --workspace=@repo/types \
 && npm run build --workspace=@repo/web \
 && node -e "const fs=require('fs');const p='apps/web/.next/standalone/apps/web/server.js';if(!fs.existsSync(p))throw new Error('Next standalone output missing: ' + p);"

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 API_URL=http://api:5000/api
WORKDIR /workspace/apps/web
COPY --from=build --chown=node:node /workspace/apps/web/.next/standalone/apps/web ./
COPY --from=build --chown=node:node /workspace/apps/web/.next/static ./.next/static
COPY --from=build --chown=node:node /workspace/apps/web/.next/standalone/node_modules /workspace/node_modules
COPY --from=build --chown=node:node /workspace/apps/web/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
