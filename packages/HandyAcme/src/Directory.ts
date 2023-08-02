import ResultDirectory from "./types/Result/Directory";
import Fetch from "./Fetch";

export default class Directory {

    constructor(public result: ResultDirectory) {}

    get newNonce() {
        return this.result.newNonce
    }

    get newAccount() {
        return this.result.newAccount
    }

    static fromResult(result: ResultDirectory) {
        return new Directory(result)
    }
    static async fromServer(url: string) {
        const result = await Fetch.fetchJSON<ResultDirectory>(url)
        return Directory.fromResult(result)
    }

    get meta() {
        return this.result.meta
    }

    get isExternalAccountRequired() {
        return this.result.meta.externalAccountRequired === true
    }
}
