export interface accountInterfaceInput {
    name: string,
    type: string,
    contact: string,
    email: string,
    subscriptionExpiration : string | null,
    password: string,
    profile  :string,
    isBan : boolean,
    pin : string | null,
    location?: {
        lat?: number | null
        long?: number | null
    } | null

}

export interface accountInterface extends accountInterfaceInput {
    _id : string,
}
