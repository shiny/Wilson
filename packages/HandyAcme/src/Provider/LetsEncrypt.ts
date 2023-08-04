import Provider from "../Datasets/Provider"
const letsencrypt: Provider = {
    name: 'LetsEncrypt',
    productionUrl: "https://acme-v02.api.letsencrypt.org/directory",
    stagingUrl: "https://acme-staging-v02.api.letsencrypt.org/directory"
}
export default letsencrypt
