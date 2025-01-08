FROM ubuntu:20.04 as base

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update -y && apt-get install -y \
  apt-transport-https \
  curl \
  make \
  gcc \
  g++

# nodejs
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash

# install depdencies and enable corepack
RUN apt-get update -y && apt-get install -y --allow-unauthenticated nodejs
RUN corepack enable

# Set cache dir so it can be shared between different docker stages
RUN yarn config set cache-folder /tmp/yarn-cache

FROM base as setup

# AFJ specifc setup
WORKDIR /www

# Copy root package files
COPY package.json /www/package.json
COPY yarn.lock /www/yarn.lock

# Copy patches folder
COPY patches /www/patches

# Run yarn install
RUN yarn install

COPY tsconfig.build.json /www/tsconfig.build.json
COPY . /www

RUN yarn build

FROM base as final

WORKDIR /www

COPY --from=setup /www/build /www/build
COPY --from=setup /tmp/yarn-cache /tmp/yarn-cache

# Copy root package files and mediator app package
COPY package.json /www/package.json
COPY yarn.lock /www/yarn.lock

# Copy patches folder
COPY patches /www/patches

WORKDIR /www

# Run yarn install
RUN yarn install --production

# Clean cache to reduce image size
RUN yarn cache clean

ENTRYPOINT [ "yarn", "start" ]
