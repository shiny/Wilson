declare type MatchedRoute = import('bun').MatchedRoute
declare type SodaResponse = Response | string | number | Object

declare type FetchMethod = (ctx: HttpContext) => void | SodaResponse | Promise<SodaResponse>


declare module Soda {
    declare interface HttpResource {
        index?: FetchMethod
        show?: FetchMethod
        store?: FetchMethod
        update?:FetchMethod
        destory?: FetchMethod
    }
    declare interface HttpContext {
        matchedRoute: MatchedRoute
        request: Request
        params: MatchedRoute['params']
        query: MatchedRoute['query']
    }
}