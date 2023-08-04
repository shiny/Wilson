import { type Serve } from "bun"
import { Directory } from 'handyacme'
/**
 * Entrance of this Application
 * with hot reloading support
 * @docs https://bun.sh/guides/http/hot
 */
export default {
    async fetch(req) {
        const directory = await Directory.from('LetsEncrypt', 'staging')
        return new Response(JSON.stringify(directory.result), {
            headers: {
                'content-type': 'application/json'
            }
        })
    },
} satisfies Serve;