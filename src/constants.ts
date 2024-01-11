import { LogLevel } from '@aries-framework/core'
import * as dotenv from 'dotenv';
dotenv.config();

export const AGENT_PORT = process.env.AGENT_PORT ? Number(process.env.AGENT_PORT) : 3000
export const AGENT_NAME = process.env.AGENT_NAME || 'Animo Mediator'
export const WALLET_NAME = process.env.WALLET_NAME || 'animo-mediator-dev'
export const WALLET_KEY = process.env.WALLET_KEY || 'animo-mediator-dev'
export const AGENT_ENDPOINTS = process.env.AGENT_ENDPOINTS?.split(',') ?? [
  `http://localhost:${AGENT_PORT}`,
  `ws://localhost:${AGENT_PORT}`,
]

export const POSTGRES_HOST = process.env.POSTGRES_HOST
export const POSTGRES_USER = process.env.POSTGRES_USER
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD
export const POSTGRES_ADMIN_USER = process.env.POSTGRES_ADMIN_USER
export const POSTGRES_ADMIN_PASSWORD = process.env.POSTGRES_ADMIN_PASSWORD

export const INVITATION_URL = process.env.INVITATION_URL

export const LOG_LEVEL = LogLevel.debug

export const IS_DEV = process.env.NODE_ENV === 'development'

export const USE_PUSH_NOTIFICATIONS = process.env.USE_PUSH_NOTIFICATIONS === 'true'
export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID
export const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined
export const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL

export const FIREBASE_NOTIFICATION_TITLE = process.env.FIREBASE_NOTIFICATION_TITLE
export const FIREBASE_NOTIFICATION_BODY = process.env.FIREBASE_NOTIFICATION_BODY

export const NOTIFICATION_WEBHOOK_URL = process.env.NOTIFICATION_WEBHOOK_URL

