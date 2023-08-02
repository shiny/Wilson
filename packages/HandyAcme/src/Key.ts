export type SupportedAlg = 'ES256' | 'RS256'
const algParams = {
    ES256: {
        genParams: {
            name: "ECDSA",
            namedCurve: "P-256",
        },
        signParams: {
            name: "ECDSA",
            hash: "SHA-256",
        },
    },
    RS256: {
        genParams: {
            name: "RSASSA-PKCS1-v1_5",
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: "SHA-256",
        },
        signParams: {
            name: "RSASSA-PKCS1-v1_5",
        },
    }
}

interface KeyGenerateOptions {
    extractable: Parameters<typeof crypto['subtle']['generateKey']>[1]
    keyUsages: Parameters<typeof crypto['subtle']['generateKey']>[2]
}

export default class Key {

    constructor(public algName: SupportedAlg, private key: CryptoKeyPair) {

    }

    async exportPrivateJwk() {
        return crypto.subtle.exportKey('jwk', this.key.privateKey)
    }

    async exportPublicJwk() {
        return crypto.subtle.exportKey('jwk', this.key.publicKey)
    }

    /**
     * 
     * @param alg ES256, RS256
     * @param options 
     * @returns 
     * @example
     * ```typescript
     *  const key = await Key.generate('ES256', {
     *      extractable: true,
     *      keyUsages: ['sign']
     *  })
     * ```
     */
    static async generate(alg: SupportedAlg, options: KeyGenerateOptions) {
        const key = await crypto.subtle.generateKey(
            algParams[alg].genParams,
            options.extractable,
            options.keyUsages
        )
        return new Key(alg, key)
    }
    
    async sign(content: string, encoding: BufferEncoding = 'base64url') {
        const signParams = algParams[this.algName].signParams
        const bufferToSign = Buffer.from(content)
        const signedResult = await crypto.subtle.sign(
            signParams,
            this.key.privateKey,
            bufferToSign
        )
        return Buffer.from(signedResult).toString(encoding)
    }
}
