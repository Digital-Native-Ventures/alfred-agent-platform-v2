# Build stage
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
RUN apk add --no-cache bash
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/nginx/start.sh /start.sh
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 3000
CMD ["/start.sh"]