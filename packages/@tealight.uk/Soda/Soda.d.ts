declare module Soda {
    declare type MatchedRoute = import('bun').MatchedRoute
    declare type SodaResponseResult = string | number | Object
    declare type FetchMethod = (ctx: HttpContext) => void | SodaResponseResult | Promise<SodaResponseResult>
    declare interface HttpResource {
        index?: FetchMethod
        show?: FetchMethod
        store?: FetchMethod
        update?:FetchMethod
        destory?: FetchMethod
    }
    declare type SodaRequest = import("./SodaRequest").default
    declare type SodaResponse = import("./SodaResponse").default
    declare type Application = import("./Application").default
    declare interface HttpContext {
        app: soda.Application
        matchedRoute: MatchedRoute
        request: SodaRequest
        response: SodaResponse
        params: MatchedRoute['params']
        query: MatchedRoute['query']
    }
}
