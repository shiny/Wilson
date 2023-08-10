export type FetchFn = (request: Request | string | URL, init?: FetchRequestInit | undefined) => Promise<Response>
export type IfMatchFn = (reg: RegExp | string | ReturnConditionCallback) => typeof Fetch | Fetch
export type ReturnConditionCallback = (url: string) => boolean
import merge from "ts-deepmerge"

/**
 * return when condition was matched
 * 
 * when condition is a string matchs url startsWith condition
 * when condition is a RegExp matchs url
 * when condition is a Callback and returns true then matchs
 * 
 * @param condition 
 */
export class ReturnCondition {
    constructor(public condition: string | RegExp | ReturnConditionCallback) {}
    match(request: Request | string | URL) {
        const url = request instanceof Request ? request.url : request.toString()
        if (typeof this.condition === 'string') {
            return url.startsWith(this.condition)
        } else if (this.condition instanceof RegExp) {
            return this.condition.test(url)
        } else if (typeof this.condition === 'function') {
            return this.condition(url)
        } else {
            return url.match(this.condition) !== null
        }
    }
}

/**
 * a Fetch wraper
 * @example
 * ```typescript
 * const result = await Fetch
 *      .returnJson({ status: 'ok' })
 *      .ifMatch('https://dummyjson.com')
 *      .fetch('https://dummyjson.com/products')
 * // result is { status: 'ok' }
 * console.log(result)
 * ```
 */
export default class Fetch {

    public requestContentType?: string 

    // Mock Settings

    #returnedResponse?: Response
    private static globalReturnedResponse?: Response

    get returnedResponse() {
        if (this.#returnedResponse) {
            return this.#returnedResponse
        }
        if (Fetch.globalReturnedResponse) {
            return Fetch.globalReturnedResponse
        }
        return null
    }

    static get returnedResponse() {
        return this.globalReturnedResponse
    }

    static globalReturnCondition?: ReturnCondition
    #returnCondition?: ReturnCondition

    shouldReturn(request: string | Request | URL) {
        if (this.returnedResponse) {
            if (this.#returnCondition) {
                return this.#returnCondition.match(request)
            }
            if (Fetch.globalReturnCondition) {
                return Fetch.globalReturnCondition.match(request)
            }
            return true
        } else {
            return false
        }
    }

    returnResponse(response: Response) {
        this.#returnedResponse = response
        return this
    }
    static returnResponse(response: Response) {
        this.globalReturnedResponse = response
        return this
    }
    returnJson = (jsonData: any) => {
        this.returnResponse(new Response(JSON.stringify(jsonData), {
            headers: {
                'content-type': 'application/json'
            }
        }))
        return this
    }
    static returnJson(jsonData: any) {
        this.returnResponse(new Response(JSON.stringify(jsonData), {
            headers: {
                'content-type': 'application/json'
            }
        }))
        return this
    }
    returnText(text: string) {
        this.returnResponse.call(this, new Response(text))
        return this
    }
    static returnText(text: string) {
        this.returnResponse(new Response(text))
        return this
    }
    static ifMatch: IfMatchFn = (reg) => {
        this.globalReturnCondition = new ReturnCondition(reg)
        return this
    }
    ifMatch: IfMatchFn = (reg) => {
        this.#returnCondition = new ReturnCondition(reg)
        return this
    }
    restoreMock() {
        this.#returnedResponse = undefined
        this.#returnCondition = undefined
    }
    static restoreMock() {
        this.globalReturnedResponse = undefined
        this.globalReturnCondition = undefined
    }

    // Proxy Settings

    static globalProxy: string
    #proxy?: string
    
    get proxy() {
        return this.#proxy ?? Fetch.globalProxy
    }
    static withProxy(proxy: string) {
        this.globalProxy = proxy
        return this
    }
    withProxy = (proxy: string) => {
        this.#proxy = proxy
        return this
    }

    options?: FetchRequestInit
    withOptions(options: FetchRequestInit) {
        this.options = options
        return this
    }
    resetOptions() {
        this.options = undefined
        return this
    }

    // Fetch Methods
    static fetch: FetchFn = async (request, init: FetchRequestInit = {}) => {
        return this.createInstance().fetch(request, init)
    }
    fetch: FetchFn = async(request, init: FetchRequestInit = {}) => {
        if (this.shouldReturn(request)) {
            if (!this.returnedResponse) {
                throw new Error('Mock enabled but no response set')
            }
            return this.returnedResponse
        }
        if (this.proxy && !init.proxy) {
            init.proxy = this.proxy
        }
        if (this.requestContentType) {
            const headers = new Headers(init.headers)
            headers.set('content-type', this.requestContentType)
            init.headers = Object.fromEntries(headers)
        }
        return fetch(request, merge(init, this.options ?? {}))
    }

    static async fetchJSON<T>(url: string, init: FetchRequestInit = {}) {
        return this.createInstance().fetchJSON<T>(url, init)
    }
    async fetchJSON<T>(url: string, init: FetchRequestInit = {}) {
        const response = await this.fetch(url, init)
        return response.json<T>()
    }
    static async fetchText(url: string, init: FetchRequestInit = {}) {
        return this.createInstance().fetchText(url, init)
    }
    async fetchText(url: string, init: FetchRequestInit = {}) {
        const response = await this.fetch(url, init)
        return response.text()
    }

    static createInstance() {
        return new this
    }
}
