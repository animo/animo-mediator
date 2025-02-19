FROM node:20 AS base

RUN apt-get update && \
  apt-get upgrade -y && \ 
  npm install -g corepack@latest && \
  corepack enable

FROM base AS setup

WORKDIR /build

COPY . /build

RUN pnpm install --node-linker=local && \
  pnpm --filter didcomm-mediator-service build && \
  pnpm prune --prod

FROM base AS final

WORKDIR /app

# Copy build

RUN ls -lah /build/apps/mediator/build

COPY --from=setup /build/apps/mediator/build /app/build
COPY --from=setup /build/apps/mediator/node_modules /app/node_modules
COPY --from=setup /build/apps/mediator/package.json /app

# Don't run production as root
RUN addgroup --system --gid 1001 agent && \
  adduser --system --uid 1001 agent && \
  mkdir -p /nonexistent && \
  chown agent:agent /nonexistent

USER agent

ENTRYPOINT [ "node", "build/index.js" ]
