import type { PushNotificationsFcmProblemReportReason } from './PushNotificationsFcmProblemReportReason'
import type { ProblemReportErrorOptions } from '@credo-ts/core'

import { ProblemReportError } from '@credo-ts/core'

import { PushNotificationsFcmProblemReportMessage } from '../messages'

/**
 * @internal
 */
interface PushNotificationsFcmProblemReportErrorOptions extends ProblemReportErrorOptions {
  problemCode: PushNotificationsFcmProblemReportReason
}

/**
 * @internal
 */
export class PushNotificationsFcmProblemReportError extends ProblemReportError {
  public problemReport: PushNotificationsFcmProblemReportMessage

  public constructor(public message: string, { problemCode }: PushNotificationsFcmProblemReportErrorOptions) {
    super(message, { problemCode })
    this.problemReport = new PushNotificationsFcmProblemReportMessage({
      description: {
        en: message,
        code: problemCode,
      },
    })
  }
}
