
import AcmeFetch from "./AcmeFetch";
import AcmeResponse from "./AcmeResponse";
import Directory from "./Directory";
import Key, { SupportedAlg } from "./Key";
import { createHmac } from "crypto"
type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

/**
 * the requested body send to ACME Server
 */
export interface JoseBody {
    protected: string
    payload: string
    signature: string
}

/**
 * Options to create an account
 */
export interface CreateAccountOptions {
    contact?: string[]
    termsOfServiceAgreed?: boolean
    /**
     *   If the server receives a newAccount request signed with a key for
     *   which it already has an account registered with the provided account
     *   key, then it MUST return a response with status code 200 (OK) and
     *   provide the URL of that account in the Location header field.
     */
    onlyReturnExisting?: boolean
}
export interface CreateAccountOptionsWithEab extends CreateAccountOptions {
    externalAccountBinding: JoseBody
}

export type RequestProtected = {
    alg: SupportedAlg
    url: string
    nonce: string
    kid: string
}
/**
 * for a new account
 * it needs a JSONWebKey and no accountUrl (kid)
 */
export type RequestProtectedUsingKey = {
    jwk: JsonWebKey
} & Omit<RequestProtected, 'kid'>
type CapsuledSignatureFunc = (content: string) => string | Promise<string>
export async function capsuleJoseBody(dataProtected: any, payload: unknown, sign: CapsuledSignatureFunc) {
    const dataPayload: string = payload === '' ? '' : JSONStringifyBase64url(payload)
    const joseBody = {
        protected: JSONStringifyBase64url(dataProtected),
        payload: dataPayload,
        signature: ''
    }
    joseBody.signature = await Promise.resolve(sign(`${joseBody.protected}.${joseBody.payload}`))
    return joseBody
}

export function JSONStringifyBase64url(data: any): string {
    return Buffer.from(JSON.stringify(data)).toString('base64url')
}

export default class Account {

    #directory?: Directory
    static useDirectory(directory: Directory) {
        const account = new Account()
        account.directory = directory
        return account
    }
    get directory() {
        if (!this.#directory) {
            throw new Error('No directory set for account')
        }
        return this.#directory
    }
    set directory(directory: Directory) {
        this.#directory = directory
    }

    #key?: Key
    get key() {
        if (!this.#key) {
            throw new Error('Account key havn\'t generated yet')
        }
        return this.#key
    }
    async generateKey() {
        this.#key = await Key.generate('ES256', {
            extractable: true,
            keyUsages: ['sign']
        })
        return this.#key
    }

    async exportPrivateKey() {
        return this.key.exportPrivateJwk()
    }

    async exportPublicKey() {
        return this.key.exportPublicJwk()
    }

    async exportPublicThumbprint() {
        return this.key.exportPublicThumbprint()
    }

    public url?: string
    public kid?: string
    public hmacKey?: Buffer

    /**
     * Provide the eab keys for register an account
     * @param kid 
     * @param hmacKey 
     * @returns 
     */
    withEabKey(kid: string, hmacKey: string) {
        this.kid = kid
        this.hmacKey = Buffer.from(hmacKey, 'base64')
        return this
    }
    get eabPair() {
        if (!this.kid || !this.hmacKey) {
            throw new Error('EAB Key is required')
        }
        return {
            kid: this.kid,
            hmacKey: this.hmacKey
        }
    }

    get isExternalAccountRequired() {
        return this.directory.meta.externalAccountRequired === true
    }

    #fetcher?: AcmeFetch
    get fetcher() {
        if (!this.#fetcher) {
            this.#fetcher = AcmeFetch
                .useDirectory(this.directory)
                .useAccount(this)
        }
        return this.#fetcher
    }

    public lastResponse?: AcmeResponse

    /**
     * @example
     * ```typescript
     * const email = `admin@example.org`
     * const res = await Account.create({
     *  contact: [`mailto:${email}`],
     *  termsOfServiceAgreed: true
     * })
     * ```
     * @param options.contact Array of email addresses
     * @param options.termsOfServiceAgreed MUST be true
     * @returns 
     */
    async create(options: CreateAccountOptions) {
        if (!this.#key) {
            await this.generateKey()
        }
        if (this.isExternalAccountRequired) {
            const jwk = await this.exportPublicKey()
            const hash: CapsuledSignatureFunc = (content) => {
                return createHmac(
                    'sha256',
                    this.eabPair.hmacKey
                ).update(content).digest('base64url')
            }
            const externalAccountBinding = await capsuleJoseBody({
                alg: "HS256",
                kid: this.eabPair.kid,
                url: this.directory.newAccount
            }, jwk, (content) => hash(content))
            this.lastResponse = await this.fetcher.postSignaturedUsingKey(this.directory.newAccount, {
                ...options,
                externalAccountBinding
            })
        } else {
            this.lastResponse = await this.fetcher.postSignaturedUsingKey(this.directory.newAccount, options)
        }
        this.url = this.lastResponse.location
        return this
    }

    async sign(content: string) {
        if (!this.#key) {
            throw new Error('Account key did not generated yet')
        }
        return this.#key.sign(content)
    }

    async makeRequestBodyUsingKey(bodyProtected: Omit<RequestProtectedUsingKey, 'jwk' | 'alg'>, payload: CreateAccountOptions) {
        return this.makeRequestBody({
            ...bodyProtected,
            jwk: await this.exportPublicKey()
        }, payload)
    }

    makeRequestBody(bodyProtected: Optional<RequestProtectedUsingKey, 'alg'>, payload: CreateAccountOptions): Promise<JoseBody>;
    makeRequestBody(bodyProtected: Optional<RequestProtected, 'alg' | 'kid'>, payload?: unknown): Promise<JoseBody>;
    async makeRequestBody(bodyProtected: Optional<RequestProtectedUsingKey, 'alg'> | Optional<RequestProtected, 'alg' | 'kid'>, payload?: unknown): Promise<JoseBody> {
        // Set default alg from #key
        if (!bodyProtected.alg) {
            bodyProtected.alg = this.#key?.algName
        }
        if ('jwk' in bodyProtected) {
            // 
        } else if(!bodyProtected.kid) {
            if (!this.url) {
                throw new Error('Account Url Required')
            }
            bodyProtected.kid = this.url
        }
        return capsuleJoseBody(bodyProtected, payload, content => this.sign(content))
    }

    async from({ key, url }: { key: JsonWebKey, url?: string}) {
        this.#key = await Key.fromPrivateKey(key, 'ES256')
        if (url) {
            this.url = url
        }
        return this
    }
}
