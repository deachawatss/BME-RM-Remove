# =============================================================================
# RM Partial Picking Remover - Backend Dockerfile
# Rust + Actix-web API
# Port: 6066
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder
# -----------------------------------------------------------------------------
FROM rust:1.84-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Create a new empty cargo project for caching dependencies
WORKDIR /usr/src/app

# Copy Cargo files first for better layer caching
COPY Cargo.toml Cargo.lock ./

# Create dummy main.rs to build dependencies
RUN mkdir -p src && echo "fn main() {}" > src/main.rs

# Build dependencies (cached layer)
RUN cargo build --release && rm -rf src/

# Copy actual source code
COPY src ./src

# Build the actual application
# Touch main.rs to force rebuild
RUN touch src/main.rs && cargo build --release

# -----------------------------------------------------------------------------
# Stage 2: Runtime
# -----------------------------------------------------------------------------
FROM ubuntu:22.04 AS runtime

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && update-ca-certificates

# Create non-root user for security
RUN groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup appuser

# Set working directory
WORKDIR /app

# Copy binary from builder
COPY --from=builder /usr/src/app/target/release/rm-partial-pick-remover-api ./app

# Set ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 6066

# Set environment variables
ENV RUST_LOG=info
ENV SERVER_PORT=6066

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://127.0.0.1:6066/api/health || exit 1

# Run the binary
CMD ["./app"]
