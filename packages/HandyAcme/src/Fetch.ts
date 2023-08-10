export type FetchFn = (request: Request | string | URL, init?: FetchRequestInit | undefined) => Promise<Response>
export type SyncFetchFn = (request: Request | string | URL, init?: FetchRequestInit | undefined) => Response

export type IfMatchFn = (reg: RegExp | string | ReturnConditionCallback) => typeof Fetch | Fetch
export type ReturnConditionCallback = (url: string) => boolean
import merge from "ts-deepmerge"

export interface FakeRouter {
    path: string | RegExp
    domain?: string
    fetch: FetchFn | SyncFetchFn | Response | Promise<Response>
}
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

export function isRouterMatched(router: FakeRouter, url: URL) {
    if (router.domain && url.hostname !== router.domain) {
        return false
    }
    if (typeof router.path === 'string') {
        return router.path === url.pathname
    }
    if (router.path instanceof RegExp) {
        return router.path.test(url.pathname)
    }
    return false
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

    get staticSelf() {
        return this.constructor as typeof Fetch
    }

    get returnedResponse() {
        if (this.#returnedResponse) {
            return this.#returnedResponse
        }
        if (this.staticSelf.globalReturnedResponse) {
            return this.staticSelf.globalReturnedResponse
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
            if (this.staticSelf.globalReturnCondition) {
                return this.staticSelf.globalReturnCondition.match(request)
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

    public static globalFakedRouters: FakeRouter[] = []
    #fakedRouters: FakeRouter[] = []

    static withFaked(router: FakeRouter): typeof this;
    static withFaked(routers: FakeRouter[]): typeof this;
    static withFaked(router: FakeRouter | FakeRouter[]) {
        if (Array.isArray(router)) {
            this.globalFakedRouters = router
        } else {
            this.globalFakedRouters = [ router ]
        }
        return this
    }
    withFaked(router: FakeRouter): this;
    withFaked(routers: FakeRouter[]): this;
    withFaked(router: FakeRouter | FakeRouter[]): this {
        if (Array.isArray(router)) {
            this.#fakedRouters = router
        } else {
            this.#fakedRouters = [ router ]
        }
        return this
    }

    matchRouter(request: string | Request | URL) {
        const url = new URL(request instanceof Request ? request.url : request)
        const findFromRouters = (routers: FakeRouter[]) => {
            return routers.find(router => isRouterMatched(router, url))
        }
        const localRouterFound = findFromRouters(this.#fakedRouters)
        if (localRouterFound) {
            return localRouterFound
        }
        const globalRouterFound = findFromRouters(this.staticSelf.globalFakedRouters)
        if (globalRouterFound) {
            return globalRouterFound
        }
    }

    restoreMock() {
        this.#returnedResponse = undefined
        this.#returnCondition = undefined
        this.#fakedRouters = []
    }
    static restoreMock() {
        this.globalReturnedResponse = undefined
        this.globalReturnCondition = undefined
        this.globalFakedRouters = []
    }

    // Proxy Settings

    static globalProxy: string
    #proxy?: string
    
    get proxy() {
        return this.#proxy ?? this.staticSelf.globalProxy
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
        const router = this.matchRouter(request)
        const options = merge(init, this.options ?? {})
        if (router) {
            if (router.fetch instanceof Response) {
                return router.fetch
            } else if (router.fetch instanceof Promise) {
                return router.fetch
            } else {
                return router.fetch(request, options)
            }
        } else {
            return fetch(request, options)
        }
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
