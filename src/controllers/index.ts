// import { createCipheriv, randomBytes } from "crypto"
export default {
    async index(ctx) {
        // const key = Buffer.from('En3mP62CkOmnzZCC356KTh3l_81fYmrSuXNCxvkkk7E', 'base64url')
        // const iv = randomBytes(12)
        // const crypto = createCipheriv('aes-256-cbc', key, iv)
        // console.log(key.toString('base64url'), iv.toString('base64url'))
        // crypto.update('222dsassf ', 'utf-8')
        // const result = crypto.final('base64url')
        // console.log('result', result)
        // return result
        return ctx.app.router
        //ctx.response.cookie('x', 'twitter')
        //return 'okk, ' + ctx.request.cookie('x')
    }
} satisfies Soda.HttpResource
