export type FetchFn = (request: Request | string | URL, init?: FetchRequestInit | undefined) => Promise<Response>
export type IfMatchFn = (reg: RegExp | string | MockConditionCallback) => typeof Fetch | Fetch
export type MockConditionCallback = (url: string) => boolean

/**
 * mock when condition was matched
 * 
 * when condition is a string matchs url startsWith condition
 * when condition is a RegExp matchs url
 * when condition is a Callback and returns true then matchs
 * 
 * @param condition 
 */
export class MockCondition {
    constructor(public condition: string | RegExp | MockConditionCallback) {}
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
 *      .mockJsonResponse({ status: 'ok' })
 *      .ifMatch('https://dummyjson.com')
 *      .fetch('https://dummyjson.com/products')
 * // result is { status: 'ok' }
 * console.log(result)
 * ```
 */
export default class Fetch {

    public requestContentType?: string 

    // Mock Settings

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

    shouldMock(request: string | Request | URL) {
        const haveMockedResponse = this.#mockedResponse || Fetch.globalMockedResponse
        if (haveMockedResponse) {
            if (this.#mockCondition) {
                return this.#mockCondition.match(request)
            }
            if (Fetch.globalMockCondition) {
                return Fetch.globalMockCondition.match(request)
            }
            return true
        } else {
            return false
        }
    }

    mockResponse(response: Response) {
        this.#mockedResponse = response
        return this
    }
    static mockResponse(response: Response) {
        this.globalMockedResponse = response
        return this
    }
    mockJsonResponse = (jsonData: any) => {
        this.mockResponse(new Response(JSON.stringify(jsonData)))
        return this
    }
    static mockJsonResponse(jsonData: any) {
        this.mockResponse(new Response(JSON.stringify(jsonData)))
        return this
    }
    mockTextResponse(text: string) {
        this.mockResponse.call(this, new Response(text))
        return this
    }
    static mockTextResponse(text: string) {
        this.mockResponse(new Response(text))
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
        this.#mockCondition = undefined
    }
    static restoreMock() {
        this.globalMockedResponse = undefined
        this.globalMockCondition = undefined
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
    // Fetch Methods
    static fetch: FetchFn = async (request, init: FetchRequestInit = {}) => {
        return this.createInstance().fetch(request, init)
    }
    fetch: FetchFn = async(request, init: FetchRequestInit = {}) => {
        if (this.shouldMock(request)) {
            if (!this.mockedResponse) {
                throw new Error('Mock enabled but no response set')
            }
            return this.mockedResponse
        }
        if (this.proxy && !init.proxy) {
            init.proxy = this.proxy
        }
        if (this.requestContentType) {
            const headers = new Headers(init.headers)
            headers.set('content-type', this.requestContentType)
            init.headers = headers
        }
        return fetch(request, init)
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
        return new Fetch
    }
}
