FROM node:24-slim

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev --quiet

# Copy application code
COPY . .

# Never run as root
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
RUN chown -R appuser:appgroup /app
USER appuser

ENV HOST=0.0.0.0
ENV PORT=4173
ENV NODE_ENV=production

EXPOSE 4173

CMD ["node", "server.js"]
