
import LetsEncrypt from "./LetsEncrypt"
import BuyPass from "./BuyPass"
import Google from "./Google"
import ZeroSSL from "./ZeroSSL"

export default {
    LetsEncrypt,
    BuyPass,
    Google,
    ZeroSSL
} as const

export type EnvTypes = 'production' | 'staging'