FROM node:20-alpine

WORKDIR /app

# Copy package manifests and install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Expose ERP API port
EXPOSE 5000

ENV PORT=5000 \
    NODE_ENV=production

CMD ["sh", "-c", "node scripts/check-env.js && node server.js"]
