import { LogLevel } from '@aries-framework/core'

export const AGENT_PORT = process.env.AGENT_PORT ? Number(process.env.AGENT_PORT) : 3000
export const AGENT_ENDPOINT = process.env.AGENT_ENDPOINT || `http://localhost:${AGENT_PORT}`
export const WALLET_ID = process.env.WALLET_ID || 'animo-mediator-dev'
export const WALLET_KEY = process.env.WALLET_KEY || 'EAyhwhZJmdzHenyDnDCFBfFxPyc9F4zXsTwzWueHHjgH'
export const AGENT_LABEL = process.env.AGENT_LABEL || 'Animo Mediator'

export const POSTGRES_HOST = process.env.POSTGRES_HOST
export const POSTGRES_USER = process.env.POSTGRES_USER
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD

export const INVITATION_URL = process.env.INVITATION_URL

export const LOG_LEVEL = LogLevel.debug

export const IS_DEV = process.env.NODE_ENV === 'development'
