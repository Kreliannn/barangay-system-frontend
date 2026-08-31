export interface accountInterfaceInput {
    profile : string,
    name: string,
    address: string,
    email: string,
    contact: string,
    password: string,
    status :  string,

    gender: string,
    dateOfBirth: string,
    civilStatus: string,
    purok: string,
    voterStatus: string,
    houseHoldNumber: string,

    idImg : {
        idFront  :  string,
        idBack :  string,
        idSelfie :  string,
    },
    skills : {
        skill  :  string,
        experience : number,
        proficiency :  string,
        availability :  string,
        services :  string[],
    }[],
    reviews : {
        _id? : string,
        user :   string,
        userProfile : string,
        star  :  number,
        skill :  string,
        message :  string,
    }[],
    averageRating? : number,
    totalReviews? : number,
}

export interface accountInterface extends accountInterfaceInput {
    _id : string,
}