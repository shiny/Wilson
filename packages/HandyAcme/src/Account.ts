
import AcmeFetch from "./AcmeFetch";
import AcmeResponse from "./AcmeResponse";
import Directory from "./Directory";
import Key, { SupportedAlg } from "./Key";
import { createHmac } from "crypto"
type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

/**
 * the requested body send to ACME Server
 */
export interface CapsuledRequestBody {
    protected: string
    payload: string
    signature: string
}

/**
 * Options to create an account
 */
export interface CreateAccountOptions {
    contact: string[]
    termsOfServiceAgreed: boolean
}
export interface CreateAccountOptionsWithEab extends CreateAccountOptions {
    externalAccountBinding: CapsuledRequestBody
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
export async function makeCapsuled(dataProtected: any, payload: unknown, sign: CapsuledSignatureFunc) {
    const capsuled = {
        protected: JSONStringifyBase64url(dataProtected),
        payload: JSONStringifyBase64url(payload),
        signature: ''
    }
    capsuled.signature = await Promise.resolve(sign(`${capsuled.protected}.${capsuled.payload}`))
    return capsuled
}

export function JSONStringifyBase64url(data: any) {
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
    async generateKey() {
        this.#key = await Key.generate('ES256', {
            extractable: true,
            keyUsages: ['sign']
        })
        return this.#key
    }

    async exportPrivateKey() {
        if (!this.#key) {
            throw new Error('Account key havn\'t generated yet')
        }
        return this.#key.exportPrivateJwk()
    }

    async exportPublicKey() {
        if (!this.#key) {
            throw new Error('Account key havn\'t generated yet')
        }
        return this.#key?.exportPublicJwk()
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
        const fetcher = AcmeFetch
            .useDirectory(this.directory)
            .useAccount(this)
        if (this.isExternalAccountRequired) {
            const jwk = await this.exportPublicKey()
            const hash: CapsuledSignatureFunc = (content) => {
                return createHmac(
                    'sha256',
                    this.eabPair.hmacKey
                ).update(content).digest('base64url')
            }
            const externalAccountBinding = await makeCapsuled({
                alg: "HS256",
                kid: this.eabPair.kid,
                url: this.directory.newAccount
            }, jwk, (content) => hash(content))
            this.lastResponse = await fetcher.postSignaturedUsingKey(this.directory.newAccount, {
                ...options,
                externalAccountBinding
            })
        } else {
            this.lastResponse = await fetcher.postSignaturedUsingKey(this.directory.newAccount, options)
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

    makeRequestBody(bodyProtected: Optional<RequestProtectedUsingKey, 'alg'>, payload: CreateAccountOptions): Promise<CapsuledRequestBody>;
    makeRequestBody(bodyProtected: Optional<RequestProtected, 'alg' | 'kid'>, payload?: unknown): Promise<CapsuledRequestBody>;
    async makeRequestBody(bodyProtected: Optional<RequestProtectedUsingKey, 'alg'> | Optional<RequestProtected, 'alg' | 'kid'>, payload?: unknown): Promise<CapsuledRequestBody> {
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
        return makeCapsuled(bodyProtected, payload, content => this.sign(content))
    }

    static fromResult() {

    }
}
