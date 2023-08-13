export default class JsonResponse extends Response{
    constructor(body: number | string | object, options?: ConstructorParameters<typeof Response>[1]) {
        options = options ?? {}
        options.headers = new Headers(options?.headers ?? {})
        options.headers.set('content-type', 'application/json')
        super(JSON.stringify(body), options)
    }
}
