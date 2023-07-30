import { OctetString, PrintableString, Utf8String } from "asn1js";
import { Attribute, AttributeTypeAndValue, CertificationRequest, Extension, Extensions, GeneralName, GeneralNames } from "pkijs";

// add line break every 64th character
function formatPEM(pemString: string)
{
  return pemString.replace(/(.{64})/g, '$1\n')
}



function extractPemContent(content: string, type: 'CERTIFICATE REQUEST' | 'RSA PRIVATE KEY' | 'PRIVATE KEY') {
    const header = `-----BEGIN ${type}-----`
    const footer = `-----END ${type}-----`
    const startPosition = content.indexOf(header) + header.length
    const endPosition = content.indexOf(footer)
    return content.substring(startPosition, endPosition).trim()
  }

// const certkey = await Bun.file('pkcs8.pem').text()
//console.log(certkey)
//console.log(extractPemContent(certkey, 'RSA PRIVATE KEY'))
const alg = {
    name: 'RSA-PSS',
    hash:{name: 'SHA-256'} 
}
// const certKeyBuf = Buffer.from(extractPemContent(certkey, 'PRIVATE KEY'), 'base64')
// const key = await crypto.subtle.importKey('pkcs8', certKeyBuf, alg, true, ['sign'])
const key = await crypto.subtle.generateKey({
    name: 'ECDSA',
    namedCurve: 'P-256'
    
}, true, ['sign'])
const csr = new CertificationRequest()
csr.version = 0
csr.subject.typesAndValues.push(new AttributeTypeAndValue({
    type: '2.5.4.6',
    value: new PrintableString({ value: 'China' })
}))
csr.subject.typesAndValues.push(new AttributeTypeAndValue({
    type: '2.5.4.3', //commonName
    value: new Utf8String({ value: '*.keqin.dev' })
}))

const altNames = new GeneralNames({
    names: [
      new GeneralName({ // domain
        type: 2,
        value: "www.keqin.dev"
      }),
      new GeneralName({ // domain
        type: 2,
        value: "*.keqin.dev"
      }),
    ]
  });
  //const subjectKeyIdentifier = await crypto.subtle.digest(alg, csr.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHexView)

  const subjectKeyIdentifier =  await crypto.subtle.digest("SHA-256",  csr.subjectPublicKeyInfo.subjectPublicKey.valueBlock.valueHexView)
csr.attributes = [
    new Attribute({
        type: "1.2.840.113549.1.9.14",
        values: [
            (new Extensions({
                extensions: [
                    new Extension({
                        // id-ce-subjectKeyIdentifier
                        extnID: '2.5.29.14',
                        critical: false,
                        extnValue: new OctetString({
                            valueHex: subjectKeyIdentifier,
                        }).toBER(false)
                    }),
                    new Extension({
                        extnID: '2.5.29.17',
                        critical: false,
                        extnValue: altNames.toSchema().toBER(false)
                    })
                ]
            })).toSchema()
        ]
    })
]
await csr.subjectPublicKeyInfo.importKey(key.privateKey)
await csr.sign(key.privateKey, 'SHA-256')


const result = await csr.toSchema().toBER(false)
console.log(`-----BEGIN CERTIFICATE REQUEST-----\n${
    formatPEM(
        Buffer.from(result).toString('base64')
    )}\n-----END CERTIFICATE REQUEST-----`)

