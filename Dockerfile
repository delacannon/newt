FROM node:21-alpine3.20 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM lipanski/docker-static-website:latest AS runner
WORKDIR /app
COPY --from=builder /app/dist .
CMD ["/busybox-httpd", "-f", "-v", "-p", "8080"]
