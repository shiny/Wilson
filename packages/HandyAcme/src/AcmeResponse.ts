import ResultErrorBase, { ResultError, isWellformedResultError } from "./ResultError"

export default class AcmeResponse {
    constructor(protected response: Response) {}
    public body?: any
    get parsedBody() {
        if (!this.body) {
            throw new Error('Acme Response has not been parsed yet')
        }
        return this.body
    }
    async parse() {
        if (!this.response.body) {
            throw new Error("Response body is null");
        }
        const reader = this.response.body.getReader()
        const { done, value } = await reader.read()
        if (done) {
            this.body = value
        } else {
            throw new Error('Failed to read response body')
        }
        return this
    }
    isEmpty(): this is AcmeEmptyResponse {
        return false
    }
    isJson(): this is AcmeJsonResponse {
        return false
    }
    isJoseJson(): this is AcmeJoseJsonResponse {
        return false
    }
    isProblemJson(): this is AcmeProblemJsonResponse {
        return false
    }
    public static from(response: Response) {
        
        const contentLength = response.headers.get('Content-Length')
        if (contentLength !== null && Number.parseInt(contentLength) === 0) {
            return new AcmeEmptyResponse(response)
        }

        switch(response.headers.get('content-type')) {
            case 'application/problem+json':
                return new AcmeProblemJsonResponse(response)
            case 'application/jose+json':
                return new AcmeJoseJsonResponse(response)
            case 'application/json':
                return new AcmeJsonResponse(response)
            case 'application/pem-certificate-chain':
                return new AcmeTextResponse(response)
            default:
                return new AcmeResponse(response)
        }
    }

    get replayNonce() {
        return this.response.headers.get('replay-nonce')
    }

    get contentType() {
        return this.response.headers.get('content-type')
    }

    get headers() {
        return this.response.headers
    }

    get location() {
        const location = this.response.headers.get('location')
        if (!location) {
            throw new Error('No location field in response headers')
        }
        return location
    }
    /**
     * Get oringinal Response
     * @returns 
     */
    toWebResponse() {
        return this.response
    }
}

export class AcmeTextResponse extends AcmeResponse {
    isText(): this is AcmeTextResponse {
        return true
    }
    async parse() {
        this.body = await this.response.text()
        return this
    }
}

export class AcmeEmptyResponse extends AcmeResponse {
    isEmpty(): this is AcmeEmptyResponse {
        return true
    }
    async parse() {
        this.body = await this.response.text()
        return this
    }
}

class AcmeJsonResponseBase extends AcmeResponse {
    async parse<T>() {
        this.body = await this.response.json<T>()
        return this
    }
}

export class AcmeJsonResponse extends AcmeJsonResponseBase {
    get contentType() {
        return 'application/json' as const
    }
    isJson(): this is AcmeJsonResponse {
        return true
    }
}

export class AcmeJoseJsonResponse extends AcmeJsonResponseBase {
    get contentType() {
        return 'application/jose+json' as const
    }
    isJoseJson(): this is AcmeJoseJsonResponse {
        return true
    }
}

export class AcmeProblemJsonResponse extends AcmeJsonResponseBase {
    get contentType() {
        return 'application/problem+json' as const
    }
    isProblemJson(): this is AcmeProblemJsonResponse {
        return true
    }
    async parse() {
        await super.parse<ResultError>()
        return this
    }
    get parsedBody(): ResultError {
        if (!isWellformedResultError(this.body)) {
            console.log(this.body)
            throw new Error('Failed to parse Acme Error response')
        } else {
            return this.body
        }
    }

    throwError() {
        ResultErrorBase.throw(this.parsedBody)
    }
}

