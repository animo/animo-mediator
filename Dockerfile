FROM ubuntu:18.04 as base

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update -y && apt-get install -y \
    software-properties-common \
    apt-transport-https \
    curl \
    git \
    # Only needed to build indy-sdk
    build-essential  \
    # Postgres plugin
    libzmq3-dev libsodium-dev pkg-config libssl-dev

# libindy
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys CE7709D068DB5E88
RUN add-apt-repository "deb https://repo.sovrin.org/sdk/deb bionic stable"

# nodejs
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash

# yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

# install depdencies
RUN apt-get update -y && apt-get install -y --allow-unauthenticated \
    libindy \
    nodejs

# Install yarn seperately due to `no-install-recommends` to skip nodejs install 
RUN apt-get install -y --no-install-recommends yarn

# Set cache dir so it can be shared between different docker stages
RUN yarn config set cache-folder /tmp/yarn-cache

# postgres plugin setup
# install rust and set up rustup
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
# See https://github.com/hyperledger/aries-framework-javascript/pull/1036
RUN rustup default 1.63.0

WORKDIR /indy-sdk-build
# clone indy-sdk and build postgres plugin
RUN git clone https://github.com/hyperledger/indy-sdk.git
WORKDIR /indy-sdk-build/indy-sdk/experimental/plugins/postgres_storage/
RUN cargo build --release

# set up library path for postgres plugin
ENV LIB_INDY_STRG_POSTGRES="/indy-sdk-build/indy-sdk/experimental/plugins/postgres_storage/target/release"
RUN mv /indy-sdk-build/indy-sdk/experimental/plugins/postgres_storage/target/release/libindystrgpostgres.so /usr/local/lib/libindystrgpostgres.so

FROM base as setup

# AFJ specifc setup
WORKDIR /www

# Copy root package files and mediator app package
COPY package.json /www/package.json
COPY yarn.lock /www/yarn.lock
COPY apps/mediator/package.json /www/apps/mediator/package.json

WORKDIR /www/apps/mediator

# Run yarn install with npmrc token as secret
RUN --mount=type=secret,id=NPM_RC,target=.npmrc yarn install

COPY tsconfig.build.json /www/tsconfig.build.json
COPY apps/mediator /www/apps/mediator

RUN yarn build

FROM base as final

WORKDIR /www

COPY --from=setup /www/apps/mediator/build /www/apps/mediator/build
COPY --from=setup /tmp/yarn-cache /tmp/yarn-cache

# Copy root package files and mediator app package
COPY package.json /www/package.json
COPY yarn.lock /www/yarn.lock
COPY apps/mediator/package.json /www/apps/mediator/package.json

WORKDIR /www/apps/mediator

# Run yarn install with npmrc token as secret
RUN --mount=type=secret,id=NPM_RC,target=.npmrc yarn install --production

# Clean cache to reduce image size
RUN yarn cache clean

# set up library path for postgres plugin
ENV LIB_INDY_STRG_POSTGRES="/indy-sdk-build/indy-sdk/experimental/plugins/postgres_storage/target/release"

ENTRYPOINT [ "yarn", "start" ]
