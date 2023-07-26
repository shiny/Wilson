
type FetchFn = (request: Request | string | URL, init?: FetchRequestInit | undefined) => Promise<Response>
type MockConditionCallback = (url: string) => boolean
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
const emptyMockCondition = {
    condition: '',
    match() { return false }
}

export default class Fetch {
    static #mockedResponse?: Response
    static #mockCondition: MockCondition = emptyMockCondition
    static proxy: string
    static fetch: FetchFn = async (request, init = {}) => {
        if (Fetch.#mockCondition.match(request)) {
            if (!Fetch.#mockedResponse) {
                throw new Error('Mock enabled but no response set')
            }
            return Fetch.#mockedResponse
        } else {
            if (this.proxy && !init.proxy) {
                init.proxy = this.proxy
            }
            return fetch(request, init)
        }
    }

    static async fetchJSON<T>(url: string) {
        const response = await this.fetch(url)
        return response.json<T>()
    }
    mockResponse = (response: Response) => Fetch.mockResponse(response)
    static mockResponse(response: Response) {
        this.#mockedResponse = response
        return this
    }
    static mockJsonResponse(jsonData: any) {
        this.#mockedResponse = new Response(JSON.stringify(jsonData))
        return this
    }
    static ifMatch(reg: RegExp | string | MockConditionCallback) {
        this.#mockCondition = new MockCondition(reg)
        return this
    }
    restoreMock = () => Fetch.restoreMock()
    static restoreMock() {
        this.#mockCondition = emptyMockCondition
        this.#mockedResponse = undefined
    }
    static withProxy(proxy: string) {
        this.proxy = proxy
        return this
    }
}
