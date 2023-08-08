import { BinaryLike, createHash } from "crypto"

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

export function sha256(data: BinaryLike, encoding: BufferEncoding = 'base64url') {
    return createHash('sha256')
    .update(data)
    .digest()
    .toString(encoding)
}
/**
 * Convert a Private JsonWebKey to Pulic
 * https://stackoverflow.com/questions/72151096/how-to-derive-public-key-from-private-key-using-webcryptoapi/72153942#72153942
 * https://stackoverflow.com/questions/56807959/generate-public-key-from-private-key-using-webcrypto-api/57571350#57571350
 * 
 * @param key JsonWebKey
 */
export function convertToPublicKey(key: JsonWebKey) {
    const publicJwk: JsonWebKey = { ...key , d: undefined }
    return publicJwk
}

export default class Key {

    constructor(public algName: SupportedAlg, private key: CryptoKeyPair) {

    }

    exportCryptoKeyPair() {
        return this.key
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

    /**
     * Jwk Thumbprint
     * https://datatracker.ietf.org/doc/html/rfc7638
     */
    async exportPublicThumbprint() {
        const jwk = await this.exportPublicJwk()
        // JWK Members Used in the Thumbprint Computation
        // https://datatracker.ietf.org/doc/html/rfc7638#section-3.2

        type EsJsonWebKey = Pick<JsonWebKey, 'crv' | 'kty' | 'x' | 'y'>
        type RsJsonWebKey = Pick<JsonWebKey, 'e' | 'kty' |'n'>
        /* Sort keys */
        const sortedJwk = (() => {
            if (this.algName === 'ES256') {
                const sorted: EsJsonWebKey = {
                    crv: jwk.crv,
                    kty: jwk.kty,
                    x: jwk.x,
                    y: jwk.y
                }
                return sorted
            } else {
                const sorted: RsJsonWebKey = {
                    e: jwk.e,
                    kty: jwk.kty,
                    n: jwk.n,
                }
                return sorted
            }
        })()
        return sha256(JSON.stringify(sortedJwk))
    }

    static async fromPrivateKey(key: JsonWebKey, alg: SupportedAlg = 'ES256') {
        const publicJwk = convertToPublicKey(key)
        const params: EcKeyImportParams | RsaHashedImportParams = algParams[alg].genParams
        const extractable = true
        const privateKey: CryptoKey = await crypto.subtle.importKey('jwk', key, params, extractable, ['sign'])
        const publicKey: CryptoKey = await crypto.subtle.importKey('jwk', publicJwk, params, extractable, [])
        return new Key(alg, {
            privateKey,
            publicKey
        })
    }
}
