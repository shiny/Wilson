export default interface ResultDirectory {
    newNonce: string
    newAccount: string
    newOrder: string
    keyChange: string
    revokeCert: string
    meta: {
        website: string
        caaIdentities: string[]
        termsOfService: string
        externalAccountRequired?: boolean
    }

    newAuthz?: string
    renewalInfo?: string
}
