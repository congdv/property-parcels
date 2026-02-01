# ---- Base ----
# This stage holds the package files and sets up the working directory.
FROM node:lts-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---- Dependencies ----
# This stage installs all npm dependencies. It's a separate stage to leverage Docker caching.
# This layer is only rebuilt when package.json or package-lock.json changes.
FROM base AS dependencies
RUN npm ci

# ---- Build ----
# This stage builds the TypeScript application.
# It copies the dependencies from the 'dependencies' stage and the source code.
FROM dependencies AS build
COPY . .
RUN npm run build

# ---- Release ----
# This is the final production image.
# It starts from the base image and installs only production dependencies.
FROM base AS release
RUN npm ci --omit=dev
# Copy the built application from the 'build' stage.
COPY --from=build /app/dist ./dist
# Add curl for the healthcheck.
RUN apk add --no-cache curl

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["npm", "start"]
