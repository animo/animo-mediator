import { LogLevel } from '@aries-framework/core'

export const AGENT_PORT = process.env.AGENT_PORT ? Number(process.env.AGENT_PORT) : 3000
export const AGENT_NAME = process.env.AGENT_NAME || 'Animo Mediator'
export const WALLET_NAME = process.env.WALLET_NAME || 'animo-mediator-dev'
export const WALLET_KEY = process.env.WALLET_KEY || 'animo-mediator-dev'
export const AGENT_ENDPOINTS = process.env.AGENT_ENDPOINTS?.split(',') ?? [
  `http://localhost:${AGENT_PORT}`,
  `ws://localhost:${AGENT_PORT}`,
]

export const POSTGRES_DATABASE_URL = process.env.POSTGRES_DATABASE_URL
export const POSTGRES_USER = process.env.POSTGRES_USER
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD
export const POSTGRES_ADMIN_USER = process.env.POSTGRES_ADMIN_USER
export const POSTGRES_ADMIN_PASSWORD = process.env.POSTGRES_ADMIN_PASSWORD
export const POSTGRES_TLS_CA_FILE = process.env.POSTGRES_TLS_CA_FILE
export const POSTGRES_TLS_CA = process.env.POSTGRES_TLS_CA

export const INVITATION_URL = process.env.INVITATION_URL

export const LOG_LEVEL = LogLevel.debug

export const IS_DEV = process.env.NODE_ENV === 'development'
export const DEBUG_INDY = process.env.DEBUG_INDY === 'true'
