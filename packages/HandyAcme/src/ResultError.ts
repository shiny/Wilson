export type ResultError = RegularResultError | GoogleResultError

/**
 * Result in Let's Encrypt or ZeroSSL
 */
export interface RegularResultError {
    readonly type: string
    readonly status: 400
    readonly detail: string
}
/**
 * Google Trust Services Result
 * @example
 * ```typescript
 * {
 *     type: "urn:ietf:params:acme:error:externalAccountRequired",
 *     detail: "External Account Binding is required for new accounts. See https://tools.ietf.org/html/rfc8555#section-7.3.4 for more information.",
 *     requestID: "H1vNedzMvWNiIHPPpQQyig"
 * }
 * ```
 */
export interface GoogleResultError {
    readonly type: string
    readonly detail: string
    readonly requestID: string
}

export function isWellformedResultError(result: any): result is ResultError {
    if (!result) {
        return false
    }
    if (!('type' in result) || !result.type.toString().startsWith('urn:ietf:params:acme:error:')) {
        return false
    }
    if (!('detail' in result)) {
        return false
    }
    return true
}


export default class ResultErrorBase extends Error {
    readonly type: string
    readonly detail: string
    constructor(result: ResultError) {
        super(`Acme Error: ${result.detail} (type: ${result.type})`)
        this.type = result.type
        this.detail = result.detail
    }
    static throw(result: ResultError) {
        switch(result.type) {
            case 'urn:ietf:params:acme:error:externalAccountRequired':
                throw new ResultErrorExternalAccountRequired(result);
            case 'urn:ietf:params:acme:error:unauthorized':
                throw new ResultErrorUnauthorized(result);
            case 'urn:ietf:params:acme:error:malformed':
                throw new ResultErrorMalformed(result)
            default:
                throw new ResultErrorBase(result)
        }
    }
}

export class ResultErrorExternalAccountRequired extends ResultErrorBase {
    type = "urn:ietf:params:acme:error:externalAccountRequired" as const
}
export class ResultErrorUnauthorized extends ResultErrorBase {
    type = "urn:ietf:params:acme:error:unauthorized" as const
}
export class ResultErrorMalformed extends ResultErrorBase {
    type = "urn:ietf:params:acme:error:malformed" as const
}


export type PossibleErrorResults = 
    ResultErrorExternalAccountRequired | ResultErrorUnauthorized | ResultErrorBase |
    ResultErrorMalformed
