import Challenge, { isChallenge } from "./Challenge"
import Identifier, { isIdentifier } from "./Identifier"
export const authzStatues = [
    "pending",
    "valid",
    "invalid",
    "deactivated",
    "expired",
    "revoked",
] as const

export default interface Authorization {
    status: typeof authzStatues[number]
    expires: string
    identifier: Identifier
    challenges: Challenge[]
    wildcard?: boolean
}

export function isAuthorization(result: unknown): result is Authorization {
    const obj: any = result
    if (!authzStatues.includes((result as any).status)) {
        return false
    }
    if (typeof obj.expires !== 'string') {
        return false
    }
    if (!isIdentifier(obj.identifier)) {
        return false
    }
    if (!Array.isArray(obj.challenges)) {
        return false
    }
    if (!obj.challenges.every(isChallenge)) {
        return false
    }
    // wildcard must is undefined or boolean
    if (!['undefined', 'boolean'].includes(typeof obj.wildcard)) {
        return false
    }
    return true
}
