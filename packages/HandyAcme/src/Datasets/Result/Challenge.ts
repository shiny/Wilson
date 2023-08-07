export const challengeTypes = [
    "dns-01", "http-01", "tls-alpn-01"
] as const

export const challengeStatues = [
    "pending", "processing", "valid", "invalid"
] as const

export default interface Challenge {
    type: typeof challengeTypes[number]
    status: typeof challengeStatues[number]
    url: string
    token: string
}

export function isChallenge(result: unknown): result is Challenge {
    if (!result) {
        return false
    }
    if (!challengeTypes.includes((result as any)?.type)) {
        return false
    }
    if (!challengeStatues.includes((result as any)?.status)) {
        return false
    }
    if (typeof (result as any)?.url !== 'string') {
        return false
    }
    if (typeof (result as any)?.token !== 'string') {
        return false
    }
    return true
}