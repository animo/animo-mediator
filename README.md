<p align="center">
  <picture>
   <source media="(prefers-color-scheme: light)" srcset="https://res.cloudinary.com/animo-solutions/image/upload/v1656578320/animo-logo-light-no-text_ok9auy.svg">
   <source media="(prefers-color-scheme: dark)" srcset="https://res.cloudinary.com/animo-solutions/image/upload/v1656578320/animo-logo-dark-no-text_fqqdq9.svg">
   <img alt="Animo Logo" height="250px" />
  </picture>
</p>

<h1 align="center" ><b>Animo Development Mediator</b></h1>

<h4 align="center">Powered by &nbsp; 
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://res.cloudinary.com/animo-solutions/image/upload/v1656579715/animo-logo-light-text_cma2yo.svg">
    <source media="(prefers-color-scheme: dark)" srcset="https://res.cloudinary.com/animo-solutions/image/upload/v1656579715/animo-logo-dark-text_uccvqa.svg">
    <img alt="Animo Logo" height="12px" />
  </picture>
</h4><br>

<!-- TODO: Add relevant badges, like CI/CD, license, codecov, etc. -->

<p align="center">
  <a href="https://typescriptlang.org">
    <img src="https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg" />
  </a>
  <a href="https://github.com/animo/animo-mediator/pkgs/container/animo-mediator">
    <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/animo/animo-mediator?display_name=tag&label=docker%20tag">
  </a>
</p>

<p align="center">
  <a href="#getting-started">Getting started</a> 
  &nbsp;|&nbsp;
  <a href="#environment-variables">Environment Variables</a> 
  &nbsp;|&nbsp;
  <a href="#postgres-database">Postgres Database</a> 
  &nbsp;|&nbsp;
  <a href="#using-docker">Using Docker</a> 
  &nbsp;|&nbsp;
  <a href="#roadmap">Roadmap</a> 
  &nbsp;|&nbsp;
  <a href="#how-to-contribute">How To Contribute</a> 
  &nbsp;|&nbsp;
  <a href="#license">License</a> 
</p>

---

This repo contains a [Mediator](https://github.com/hyperledger/aries-rfcs/blob/main/concepts/0046-mediators-and-relays/README.md) Agent for usage with [Hyperledger Aries and DIDComm v1 agents](https://github.com/hyperledger/aries-rfcs/tree/main/concepts/0004-agents). It is built using [Aries Framework JavaScript](https://github.com/hyperledger/aries-framework-javascript).

Why should you use this mediator?

- Automatically set up mediation with the mediator using the [Mediator Coordination Protocol](https://github.com/hyperledger/aries-rfcs/tree/main/features/0211-route-coordination).
- Pick up messages implicitly using WebSockets, using the [Pickup V1 Protocol](https://github.com/hyperledger/aries-rfcs/tree/main/features/0212-pickup), and the [Pickup V2 Protocol](https://github.com/hyperledger/aries-rfcs/tree/main/features/0685-pickup-v2).
- Configured to persist queued messages for recipient in a postgres.
- Use the pre-built docker image for easy deployment of your mediator.

> **Warning**
> The repository is marked as the Animo **Development** Mediator because we have primarily used this repository for the publicly hosted Animo Development Mediator. There's nothing preventing it to be used in a production scenario, but it might needs some tweaks to make it production ready. We welcome contributions that work towards this effort, and we will try to make this repository more production ready in the future.

## Getting Started

> If you want to deploy the mediator based on the pre-built docker image, please see the [Using Docker](#using-docker) section.

Make sure you have followed the `libindy` setup form the AFJ docs: https://aries.js.org/guides/next/getting-started/set-up/indy-sdk

Then run install to install dependencies:

```bash
yarn install
```

And run dev to start the development server:

```bash
yarn dev
```

In development, the `dev.ts` script will be used which will automatically set up an ngrok tunnel for you and start the mediator agent with some default values. There's no need to configure any environment variables.

To start the server in production, you can run the following command. Make sure to set the environment variables as described below.

```bash
yarn start
```

After the agent is started, a multi-use invitation will be printed to the console.

### Connecting to the Mediator

When you've correctly started the mediator agent, and have extracted the invitation from the console, you can use the invitation to connect to the mediator agent. To connect to the mediator and start receiving messages, there's a few steps that need to be taken:

1. Connect to the mediator from another agent using the created [Out Of Band Invitation](https://github.com/hyperledger/aries-rfcs/blob/main/features/0434-outofband/README.md)
2. Request mediation from the mediator using the [Mediator Coordination Protocol](https://github.com/hyperledger/aries-rfcs/tree/main/features/0211-route-coordination).
3. Start picking up messages implicitly by connecting using a WebSocket and sending any DIDComm message to authenticate, the [Pickup V1 Protocol](https://github.com/hyperledger/aries-rfcs/tree/main/features/0212-pickup), or the [Pickup V2 Protocol](https://github.com/hyperledger/aries-rfcs/tree/main/features/0685-pickup-v2). We recommend using the Pickup V2 Protocol.

If you're using an Aries Framework JavaScript agent as the client, you can follow the [Mediation Tutorial](https://aries.js.org/guides/next/tutorials/mediation) from the Aries Framework JavaScript docs. Please note, the tutorial points to the `next` version, which is for `0.4.0` at the time of writing. If the link stops working, please check the `0.4.0` docs for the tutorial.

## Environment Variables

You can provide a number of environment variables to run the agent. The following table lists the environment variables that can be used.

The `POSTGRES_` variables won't be used in development mode (`NODE_ENV=development`), but are required when `NODE_ENV` is not `development`. This makes local development easier, but makes sure you have a persistent database when deploying.

| Variable                  | Description                                                                                                                                                                                                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENT_ENDPOINTS`         | Comma separated list of endpoints, in order of preference. In most cases you want to provide two endpoints, where the first one is an HTTP url, and the second one is an WebSocket url                                                                                            |
| `AGENT_NAME`              | The name of the agent. This will be used in invitations and will be publicly advertised.                                                                                                                                                                                          |
| `AGENT_PORT`              | The port that is exposed for incoming traffic. Both the HTTP and WS inbound transport handlers are exposes on this port, and HTTP traffic will be upgraded to the WebSocket server when applicable.                                                                               |
| `WALLET_NAME`             | The name of the wallet to use.                                                                                                                                                                                                                                                    |
| `WALLET_KEY`              | The key to unlock the wallet.                                                                                                                                                                                                                                                     |
| `INVITATION_URL`          | Optional URL that can be used as the base for the invitation url. This would allow you to render a certain web page that can extract the invitation form the `oob` parameter, and show the QR code, or show useful information to the end-user. Less applicable to mediator URLs. |
| `POSTGRES_DATABASE_URL`   | The postgres database url.                                                                                                                                                                                                                                                        |
| `POSTGRES_USER`           | The postgres user.                                                                                                                                                                                                                                                                |
| `POSTGRES_PASSWORD`       | The postgres password.                                                                                                                                                                                                                                                            |
| `POSTGRES_ADMIN_USER`     | The postgres admin user.                                                                                                                                                                                                                                                          |
| `POSTGRES_ADMIN_PASSWORD` | The postgres admin password.                                                                                                                                                                                                                                                      |
| `POSTGRES_TLS_CA_FILE`    | Path to a file containing a TLS CA. Will have precedence over `POSTGRES_TLS_CA` if both are provided                                                                                                                                                                              |
| `POSTGRES_TLS_CA`         | Value of the TLS CA. Will have no effect if `POSTGRES_TLS_CA` is used as well.                                                                                                                                                                                                    |

## Postgres Database

To deploy the mediator, a postgres database is required. Any postgres database will do. The mediator deployed to `https://mediator.dev.animo.id` is deployed to a DigitalOcean managed postgres database.

1. Create a postgres database and make sure it is publicly exposed.
2. Set the `POSTGRES_DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_ADMIN_USER`, `POSTGRES_ADMIN_PASSWORD` variables. For the mediator we use the same username and password for the admin user and the regular user, but you might want to create a separate user for the admin user.
3. If you want to set up TLS (or your database requires it, like is the case with DigitalOcean), download the tls CA file, and set either the `POSTGRES_TLS_CA_FILE` or `POSTGRES_TLS_CA` variable. The `POSTGRES_TLS_CA` variable should contain the contents of the CA file, which can be an easier way to set it up in when using docker and having the contents of the CA file in a secret.

## Using Docker

### Using the pre-built Docker Image

1. Make sure you're [authenticated to the Github Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#authenticating-to-the-container-registry)
2. Run the docker image using the following command:

```sh
docker run
```

### Building the Docker Image

1. Build the docker image

```
docker build \
   -t ghcr.io/animo/animo-mediator \
   -f Dockerfile
   .
```

2. Run the docker image using the following command:

```sh
docker run \
  -e "AGENT_ENDPOINTS=http://localhost:3000,ws://localhost:3000" \
  -e "WALLET_KEY=<your-wallet-key>" \
  -e "WALLET_NAME=mediator" \
  -e "AGENT_NAME=Mediator" \
  -e "AGENT_PORT=3000" \
  -e "POSTGRES_DATABASE_URL=postgres://postgres:postgres@localhost:5432/mediator" \
  -e "POSTGRES_USER=postgres" \
  -e "POSTGRES_PASSWORD=<your-postgres-password>" \
  -e "POSTGRES_ADMIN_USER=postgres" \
  -e "POSTGRES_ADMIN_PASSWORD=<your-postgres-password>" \
  -p 3000:3000 \
  ghcr.io/animo/animo-mediator:latest
```

Make sure to use the correct tag. By default `latest` will be used which can have unexpected breakage. See the releases for the latest stable tag. Currently the last released tag is ![GitHub release (latest by date)](https://img.shields.io/github/v/release/animo/animo-mediator?display_name=tag&label=tag)

You can also adapt the `docker-compose.yml` file to your needs.

## Roadmap

The contents in this repository started out as a simple mediator built using Aries Framework JavaScript that can be used for development. Over time we've added some features, but there's still a lot we want to add to this repository over time. Some things on the roadmap:

- Replace the Indy SDK with Aries Askar
- Expose a `did:web` did, so you can directly connect to the mediator using only a did
- Allow for customizing the message queue implementation, so it doesn't have to be stored in the Indy SDK / Askar database, but rather in high-volume message queue like Kafka.
- DIDComm v2 support
- Sending push notifications to the recipient when a message is queued for them
- Allow to control acceptance of mediation requests

## 🖇️ How To Contribute

You're welcome to contribute to this repository. Please make sure to open an issue first for bigger changes!

This mediator is open source and you're more than welcome to customize and use it to create your own mediator.

## License

The Animo Mediator is licensed under the Apache License Version 2.0 (Apache-2.0).
