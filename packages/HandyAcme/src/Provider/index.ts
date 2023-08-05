
import LetsEncrypt from "./LetsEncrypt"
import BuyPass from "./BuyPass"
import Google from "./Google"
import ZeroSSL from "./ZeroSSL"
import Example from "./Example"

export default {
    LetsEncrypt,
    BuyPass,
    Google,
    ZeroSSL,
    Example
} as const

export type EnvTypes = 'production' | 'staging'