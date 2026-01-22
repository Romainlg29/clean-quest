# Pull the builder image
FROM oven/bun AS build
WORKDIR /app

# Copy dependency files
COPY package.json package.json
COPY bun.lock bun.lock

# Install dependencies
RUN bun install

# Copy source files
COPY api/src ./src
COPY tsconfig.json tsconfig.json

# Specify production environment
ENV NODE_ENV=production

# Compile the application
RUN bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--outfile server \
	src/index.ts


# Use a minimal base image for the final stage
FROM gcr.io/distroless/base
WORKDIR /app

# Copy the binary from the build stage
COPY --from=build /app/server server

# Copy the migration directory
COPY .database .database

# Set the production environment
ENV NODE_ENV=production

# Start the server
CMD ["./server"]

EXPOSE 5000