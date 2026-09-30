FROM node:24-alpine
WORKDIR /app
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --chown=node:node src ./src
USER node
EXPOSE 8000
HEALTHCHECK CMD wget -qO- http://localhost:8000/health || exit 1
CMD ["node", "src/server.ts"]
