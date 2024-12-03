import { config } from 'dotenv'
import { connect } from '@ngrok/ngrok'

config()

const port = 3000

/**
 * Connect to ngrok and then set the port and url on the environment before importing
 * the index file.
 */
// TODO: have to add auth token now to use ngrok check this later
// void connect({
//   port,
//   authtoken:'2p45GlINkb6zoJttT1Fjvvv21Am_5mjqcWP7baYFM2ZVGokSL',
// }).then((app) => {
// eslint-disable-next-line no-console
// console.log('Got ngrok url:', app.url())
// const url = app.url()
//TODO   make this configurable as per socket dock instances


const url = `http://localhost:${port}`
const wsUrl = 'ws://localhost:8765/ws'
process.env.NODE_ENV = 'development'
process.env.USE_SOCKETDOCK ='true'
process.env.AGENT_PORT = `${port}`
process.env.AGENT_ENDPOINTS = `${url},${wsUrl}`
process.env.SHORTENER_BASE_URL = `${url}/s`

require('./src/index')
// })
