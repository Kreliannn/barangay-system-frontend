export interface accountInterfaceInput {
    profile : string,
    name: string,
    address: string,
    email: string,
    contact: string,
    password: string,
    status :  string,
    idImg : {
        idFront  :  string,
        idBack :  string,
        idSelfie :  string,
    },
    skills : {
        skill  :  string,
        experience : number,
        proficiency :  string,
    }[]
}

export interface accountInterface extends accountInterfaceInput {
    _id : string,
}