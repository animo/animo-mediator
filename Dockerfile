FROM node:20 as base

workdir /app

RUN corepack enable

FROM base as setup

# Copy root package files
COPY package.json /app/package.json
COPY pnpm-lock.yaml /app/pnpm-lock.yaml
COPY patches /app/patches

# Run yarn install
RUN pnpm install

COPY . /app

RUN pnpm build

FROM base as final

WORKDIR /app

# Copy build
COPY --from=setup /app/build /app/build

COPY package.json /app/package.json
COPY pnpm-lock.yaml /app/pnpm-lock.yaml
COPY patches /app/patches

# Run yarn install
RUN pnpm install --production

# Clean cache to reduce image size
RUN pnpm store prune

# Don't run production as root
RUN addgroup --system --gid 1001 agent
RUN adduser --system --uid 1001 agent
USER agent

ENTRYPOINT [ "node", "build/index.js" ]
