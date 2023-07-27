type FetchFn = (request: Request | string | URL, init?: FetchRequestInit | undefined) => Promise<Response>
type IfMatchFn = (reg: RegExp | string | MockConditionCallback) => typeof Fetch | Fetch
type MockConditionCallback = (url: string) => boolean

/**
 * mock when condition was matched
 * 
 * when condition is a string matchs url startsWith condition
 * when condition is a RegExp matchs url
 * when condition is a Callback and returns true then matchs
 * 
 * @param condition 
 */
class MockCondition {
    constructor(public condition: string | RegExp | MockConditionCallback) {}
    match(request: Request | string | URL) {
        const url = request instanceof Request ? request.url : request.toString()
        if (typeof this.condition === 'string') {
            return url.startsWith(this.condition)
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
 *      .mockJsonResponse({ status: 'ok' })
 *      .ifMatch('https://dummyjson.com')
 *      .fetch('https://dummyjson.com/products')
 * // result is { status: 'ok' }
 * console.log(result)
 * ```
 */
export default class Fetch {
    #mockedResponse?: Response
    private static globalMockedResponse?: Response

    get mockedResponse() {
        if (this.#mockedResponse) {
            return this.#mockedResponse
        }
        if (Fetch.globalMockedResponse) {
            return Fetch.globalMockedResponse
        }
        return null
    }

    static get mockedResponse() {
        return this.globalMockedResponse
    }

    static globalMockCondition?: MockCondition
    #mockCondition?: MockCondition

    static globalProxy: string
    #proxy?: string
    
    get proxy() {
        return this.#proxy ?? Fetch.globalProxy
    }

    static fetch: FetchFn = async (request, init = {}) => {
        return this.createInstance().fetch(request, init)
    }
    fetch: FetchFn = async(request, init = {}) => {
        if (this.#mockCondition?.match(request) || Fetch.globalMockCondition?.match(request)) {
            if (!this.mockedResponse) {
                throw new Error('Mock enabled but no response set')
            }
            return this.mockedResponse
        }
        if (this.proxy && !init.proxy) {
            init.proxy = this.proxy
        }
        return fetch(request, init)
    }

    static async fetchJSON<T>(url: string, init = {}) {
        return this.createInstance().fetchJSON(url, init)
    }
    async fetchJSON<T>(url: string, init = {}) {
        const response = await this.fetch(url, init)
        return response.json<T>()
    }

    mockResponse(response: Response) {
        this.#mockedResponse = response
        return this
    }
    static mockResponse(response: Response) {
        this.globalMockedResponse = response
        return this
    }
    mockJsonResponse(jsonData: any) {
        this.mockJsonResponse(new Response(JSON.stringify(jsonData)))
        return this
    }
    static mockJsonResponse(jsonData: any) {
        this.mockResponse(new Response(JSON.stringify(jsonData)))
        return this
    }
    static ifMatch: IfMatchFn = (reg) => {
        this.globalMockCondition = new MockCondition(reg)
        return this
    }
    ifMatch: IfMatchFn = (reg) => {
        this.#mockCondition = new MockCondition(reg)
        return this
    }
    restoreMock() {
        this.#mockedResponse = undefined
    }
    static restoreMock() {
        this.globalMockedResponse = undefined
        this.globalMockCondition = undefined
    }
    static withProxy(proxy: string) {
        this.globalProxy = proxy
        return this
    }
    withProxy = (proxy: string) => {
        this.#proxy = proxy
        return this
    }
    static createInstance() {
        return new Fetch
    }
}
