<h1 align="center"><b>Mediator</b></h1>

## Running

1. `yarn install`
2. `yarn dev`

### Using Docker

1. Get token to download packages from github

- You can get a token here: https://github.com/settings/tokens
- Make sure to select the `read:packages` permission

1. Create `.npmrc` file in the root of this repository. Replace `<NPM_TOKEN>` with the github token:

```
//npm.pkg.github.com/:_authToken=<NPM_TOKEN>
@timoglastra:registry=https://npm.pkg.github.com
```

3. Build the docker image

Context must be in the root of the project. If you're running the command from the `apps/mediator` directory, replace `.` with `../..`

```
docker build \
   -t ghcr.io/timoglastra/didcomm-chat/mediator \
   -f apps/mediator/Dockerfile \
   --secret id=NPM_RC,src=.npmrc \
   .
```

If you're on ARM, replace `-f apps/mediator/Dockerfile` with `-f apps/mediator/Dockerfile.arm`

3. Run the docker image

```
docker run ghcr.io/timoglastra/didcomm-chat/mediator
```
