import ResultDirectory from "./types/Result/Directory";
import Fetch from "./Fetch";

export default class Directory {

    constructor(public result: ResultDirectory) {}

    static fromResult(result: ResultDirectory) {
        return new Directory(result)
    }
    static async fromServer(url: string) {
        const result = await Fetch.fetchJSON<ResultDirectory>(url)
        return Directory.fromResult(result)
    }

    get isExternalAccountRequired() {
        return this.result.meta.externalAccountRequired === true
    }
}
