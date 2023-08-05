export default interface ResultDirectory {
    newNonce: string
    newAccount: string
    newOrder: string
    keyChange: string
    revokeCert: string
    meta: {
        website: string
        caaIdentities: readonly string[]
        termsOfService: string
        externalAccountRequired?: boolean
    }

    newAuthz?: string
    renewalInfo?: string
}

export const buypassDirectory = {
    "new-reg": "https://api.buypass.com/acme/new-reg",
    "new-cert": "https://api.buypass.com/acme/new-cert",
    "new-authz": "https://api.buypass.com/acme/new-authz",
    "revoke-cert": "https://api.buypass.com/acme/revoke-cert",
    "key-change": "https://api.buypass.com/acme/key-change",
    "meta": {
      "website": "https://buypass.com/",
      "caa-identities": ["buypass.com"],
      "terms-of-service": "https://api.buypass.com/acme/terms/1041",
      "caaIdentities": ["buypass.com"],
      "termsOfService": "https://api.buypass.com/acme/terms/1041"
    },
    "newNonce": "https://api.buypass.com/acme-v02/new-nonce",
    "newAccount": "https://api.buypass.com/acme-v02/new-acct",
    "newAuthz": "https://api.buypass.com/acme-v02/new-authz",
    "newOrder": "https://api.buypass.com/acme-v02/new-order",
    "revokeCert": "https://api.buypass.com/acme-v02/revoke-cert",
    "keyChange": "https://api.buypass.com/acme-v02/key-change"
} as const

export const googleDirectory: ResultDirectory = {
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

export const letsencryptDirectory = {
    "cnFJhQGYgAs": "https://community.letsencrypt.org/t/adding-random-entries-to-the-directory/33417",
    "keyChange": "https://acme-v02.api.letsencrypt.org/acme/key-change",
    "meta": {
        "caaIdentities": [
            "letsencrypt.org"
        ],
        "termsOfService": "https://letsencrypt.org/documents/LE-SA-v1.3-September-21-2022.pdf",
        "website": "https://letsencrypt.org"
    },
    "newAccount": "https://acme-v02.api.letsencrypt.org/acme/new-acct",
    "newNonce": "https://acme-v02.api.letsencrypt.org/acme/new-nonce",
    "newOrder": "https://acme-v02.api.letsencrypt.org/acme/new-order",
    "renewalInfo": "https://acme-v02.api.letsencrypt.org/draft-ietf-acme-ari-01/renewalInfo/",
    "revokeCert": "https://acme-v02.api.letsencrypt.org/acme/revoke-cert"
} as const

export const zerosslDirectory: ResultDirectory = {
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

export const exampleDirectory: ResultDirectory = {
    newNonce: "https://acme.example.com/newNonce",
    newAccount: "https://acme.example.com/newAccount",
    newOrder: "https://acme.example.com/newOrder",
    revokeCert: "https://acme.example.com/revokeCert",
    keyChange: "https://acme.example.com/keyChange",
    meta: {
        termsOfService:
            "https://secure.example.com/agreement.pdf",
        website: "https://example.com",
        caaIdentities: [
            "example.com",
        ],
        externalAccountRequired: true,
    },
}

export const exampleStagingDirectory: ResultDirectory = {
    newNonce: "https://acme-staging.example.com/newNonce",
    newAccount: "https://acme-staging.example.com/newAccount",
    newOrder: "https://acme-staging.example.com/newOrder",
    revokeCert: "https://acme-staging.example.com/revokeCert",
    keyChange: "https://acme-staging.example.com/keyChange",
    meta: {
        termsOfService:
            "https://secure.example.com/agreement.pdf",
        website: "https://example.com",
        caaIdentities: [
            "example.com",
        ],
        externalAccountRequired: true,
    },
}