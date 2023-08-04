import Identifier, { isIdentifier } from "./Identifier"
const orderStatues = [
    "pending", "ready", "processing", "valid", "invalid"
] as const
export type OrderStatus = typeof orderStatues[number]
export default interface ResultOrder {
    status: OrderStatus
    expires: string
    identifiers: Identifier[]
    authorizations: string[]
    finalize: string
}

/**
 * is an array and not empty
 */
export function isFilledArray(obj: any): boolean {
    if (!Array.isArray(obj)) {
        return false
    }
    return obj.length > 0
}

export function isResultOrder(object: any): object is ResultOrder {
    if (!object) {
        return false
    }
    if (!orderStatues.includes(object?.status)) {
        return false
    }
    if (!('expires' in object)) {
        return false
    }
    if (!('finalize' in object)) {
        return false
    }
    if (!isFilledArray(object?.authorizations)) {
        return false
    }
    if (!isFilledArray(object?.identifiers)) {
        return false
    }
    return object.identifiers.every((identifier: unknown) => isIdentifier(identifier))
}
