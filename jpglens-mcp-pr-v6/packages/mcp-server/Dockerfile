# Docker image for @jpglens/mcp-server (stdio & SSE)
FROM mcr.microsoft.com/playwright:v1.46.0-jammy
WORKDIR /app
COPY packages/mcp-server/package.json ./packages/mcp-server/package.json
COPY packages/mcp-server/tsconfig.json ./packages/mcp-server/tsconfig.json
COPY packages/mcp-server/dist ./packages/mcp-server/dist
WORKDIR /app/packages/mcp-server
RUN npm i --omit=dev
ENV NODE_ENV=production
ENTRYPOINT ["node", "/app/packages/mcp-server/dist/index.js"]
