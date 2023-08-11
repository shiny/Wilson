import { type Serve } from "bun"

const router = new Bun.FileSystemRouter({
    style: 'nextjs',
    dir: import.meta.dir + '/controller',
})
/**
 * Entrance of this Application
 * with hot reloading support
 * @docs https://bun.sh/guides/http/hot
 */
export default {
    async fetch(request) {
        const matched = router.match(request)
        if (matched) {
            const { default: Controller } = await import(matched.filePath)
            const controller = new Controller
            const method = request.method.toLowerCase()
            if (method in controller) {
                return new Response(await controller[method](request))
            }
        }
        return new Response('Not Found', {
            status: 404
        })
    },
} satisfies Serve;