import ResultDirectory from "./Datasets/Result/Directory"
import Fetch from "./Fetch"
import Providers, { EnvTypes } from "./Provider"
export type SupportedProviders = keyof typeof Providers
import {
    exampleDirectory,
    exampleStagingDirectory
} from "./Datasets/Result/Directory"

export default class Directory {

    constructor(public result: ResultDirectory) {}

    get newNonce() {
        return this.result.newNonce
    }

    get newAccount() {
        return this.result.newAccount
    }

    get newOrder() {
        return this.result.newOrder
    }

    static async from(provider: SupportedProviders, env: EnvTypes) {
        const url = (() => {
            switch(env) {
                case 'production':
                    return Providers[provider].productionUrl
                case 'staging':
                    return Providers[provider].stagingUrl
                default:
                    throw new Error(`Unknow env ${env}`)
            }
        })()
        if (!url) {
            throw new Error(`No ${env} mode in provider ${provider}`)
        } else {
            return Directory.fromUrl(url)
        }
    }

    static fromResult(result: ResultDirectory) {
        return new Directory(result)
    }
    static async fromUrl(url: string) {
        const result = await Fetch.fetchJSON<ResultDirectory>(url)
        return Directory.fromResult(result)
    }
    static fake(env: EnvTypes = 'production') {
        if (env === 'production') {
            return new FakeDirectory(exampleDirectory)
        } else {
            return new FakeDirectory(exampleStagingDirectory)
        }
    }

    get meta() {
        return this.result.meta
    }

    get isExternalAccountRequired() {
        return this.result.meta.externalAccountRequired === true
    }
}

export class FakeDirectory extends Directory {}