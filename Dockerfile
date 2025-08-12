# Development Dockerfile for React Blog Frontend
FROM node:18-alpine as development

# Set working directory
WORKDIR /app

# Install git (required by some packages during yarn install)
RUN apk add --no-cache git

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S reactuser -u 1001

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Change ownership of the app directory
RUN chown -R reactuser:nodejs /app
USER reactuser

# Expose port 3000
EXPOSE 3000

# Start development server
CMD ["yarn", "start"]

# Production build stage (for future use)
FROM node:18-alpine as build

WORKDIR /app
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn run build

# Production stage
FROM nginx:alpine as production
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]