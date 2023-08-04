const identifierTypes = ['dns'] as const
type IdentifierType = typeof identifierTypes[number]
export default interface Identifier {
    type: IdentifierType
    value: string
}

export function isIdentifier(object: any): object is Identifier {
    if (identifierTypes.includes(object?.type)) {
        return typeof object.value === 'string'
    } else {
        return false
    }
}
