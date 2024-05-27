import { config } from 'dotenv'
import { connect } from '@ngrok/ngrok'

config()

const port = 3000

/**
 * Connect to ngrok and then set the port and url on the environment before importing
 * the index file.
 */
// TODO: have to add auth token now to use ngrok check this later
void connect({
  port,
}).then((app) => {
  // eslint-disable-next-line no-console
  console.log('Got ngrok url:', app.url())
  const url = app.url()

  process.env.NODE_ENV = 'development'
  process.env.AGENT_PORT = `${port}`
  process.env.AGENT_ENDPOINTS = `${url},${url?.replace('http', 'ws')}`
  process.env.SHORTENER_BASE_URL = `${url}/s`

  require('./src/index')
})
