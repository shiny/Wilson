import { test, afterEach, expect } from "bun:test"
import Fetch from "../Fetch"
import Directory from "../Directory"
const zerosslDirectory = {
  newNonce: "https://acme.zerossl.com/v2/DV90/newNonce",
  newAccount: "https://acme.zerossl.com/v2/DV90/newAccount",
  newOrder: "https://acme.zerossl.com/v2/DV90/newOrder",
  revokeCert: "https://acme.zerossl.com/v2/DV90/revokeCert",
  keyChange: "https://acme.zerossl.com/v2/DV90/keyChange",
  meta: {
    termsOfService:
        "https://secure.trust-provider.com/repository/docs/Legacy/20230516_Certificate_Subscriber_Agreement_v_2_6_click.pdf",
    website: "https://zerossl.com",
    caaIdentities: [
        "sectigo.com",
        "trust-provider.com",
        "usertrust.com",
        "comodoca.com",
        "comodo.com",
    ],
    externalAccountRequired: true,
  },
}

afterEach(() => Fetch.restoreMock())
test("Init ZeroSSL Directory", async () => {
    Fetch.mockJsonResponse(zerosslDirectory).ifMatch("https://acme.zerossl.com")
    const dir = await Directory.fromUrl(
        "https://acme.zerossl.com/v2/DV90/directory"
    )
    expect(dir.result).toEqual(zerosslDirectory)
})
