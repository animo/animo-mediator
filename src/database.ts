import type { AskarWalletPostgresStorageConfig } from '@aries-framework/askar/build/wallet'

import { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST } from './constants'

export const askarPostgresConfig: AskarWalletPostgresStorageConfig = {
  // AskarWalletPostgresStorageConfig defines interface for the Postgres plugin configuration.
  type: 'postgres',
  config: {
    host: POSTGRES_HOST as string,
    connectTimeout: 10,
  },
  credentials: {
    account: POSTGRES_USER as string,
    password: POSTGRES_PASSWORD as string,
    adminAccount: POSTGRES_USER as string,
    adminPassword: POSTGRES_PASSWORD as string,
  },
}
