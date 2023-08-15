import { join, dirname } from "path"
import { FileSystemRouter, Serve, peek } from "bun"
import SodaRequest from "SodaRequest"
import SodaResponse from "SodaResponse"
import HttpNotFound from "./Response/HttpNotFound"

export default class Application {
    appRoot: string = ''
    router: FileSystemRouter
    constructor() {
        this.appRoot = dirname(Bun.main)
        this.router = new Bun.FileSystemRouter({
            style: "nextjs",
            dir: join(this.appRoot, 'controllers'),
        })
    }
    start(): Serve {
        const app = this
        return {
            async fetch(request: Request) {
                const matchedRoute = app.router.match(request)
                if (matchedRoute) {
                    const response = new SodaResponse
                    const { default: handler } = await import(matchedRoute.filePath)
                    if (isCallable(request.method, handler)) {
                        const controller: Soda.HttpResource = handler
                        const ctx: Soda.HttpContext = {
                            app,
                            request: SodaRequest.from(request),
                            response,
                            matchedRoute,
                            // add alias
                            params: matchedRoute.params,
                            query: matchedRoute.query
                        }
                        return getResponse(ctx, controller)
                    }
                }
                return SodaResponse.send('Http Not Found', 404)
            }
        }
    }
    static start(): Serve {
        const app = new Application
        return app.start()
    }
}

function isFunction(handler: unknown): handler is Function {
    return typeof handler === 'function'
}

function isCallable(method: Request['method'], handler: unknown): handler is Soda.HttpResource {
    const controller = handler as any
    
    switch (method) {
        case 'GET':
        case 'HEAD':
            return isFunction(controller?.index) || isFunction(controller?.show)
        case 'POST':
            return isFunction(controller?.store)
        case 'PUT':
        case 'PATCH':
            return isFunction(controller?.update)
        case 'DELETE':
            return isFunction(controller?.destory)
    }
    return false
}

async function getResponse(ctx: Soda.HttpContext, resources: Soda.HttpResource) {
    const getResultFromController = () => {
        switch (ctx.request.method) {
            case "GET":
            case "HEAD":
                const method = resources.index ?? resources.show
                if (method) {
                    return method(ctx)
                }
                break
            case "POST":
                if (resources.store) {
                    return resources.store(ctx)
                }
                break
            case "PATCH":
            case "PUT":
                if (resources.update) {
                    return resources.update(ctx)
                }
                break
            case "DELETE":
                if (resources.destory) {
                    return resources.destory(ctx)
                }
                break
            default:
                return new HttpNotFound
        }
    }
    let result = peek(getResultFromController())
    const status = peek.status(result)
    if (status === 'pending') {
        result = await result
    }
    if (!result) {
        result = ''
    }
    if (result instanceof Response) {
        return result
    }
    if (result instanceof SodaResponse) {
        return result.toWebResponse()
    }
    return ctx.response.send(result as (string | number | void | Object))
}
