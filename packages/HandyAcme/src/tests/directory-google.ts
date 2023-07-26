import { expect, test } from "bun:test";
const googleDirectory = {
    "newNonce": "https://dv.acme-v02.api.pki.goog/new-nonce",
    "newAccount": "https://dv.acme-v02.api.pki.goog/new-account",
    "newOrder": "https://dv.acme-v02.api.pki.goog/new-order",
    "newAuthz": "https://dv.acme-v02.api.pki.goog/new-authz",
    "revokeCert": "https://dv.acme-v02.api.pki.goog/revoke-cert",
    "keyChange": "https://dv.acme-v02.api.pki.goog/key-change",
    "renewalInfo": "https://dv.acme-v02.api.pki.goog/renewal-info",
    "meta": {
      "termsOfService": "https://pki.goog/GTS-SA.pdf",
      "website": "https://pki.goog",
      "caaIdentities": ["pki.goog"],
      "externalAccountRequired": true
    }
}
