export class AppError extends Error {
    statusCode: number;
    //message Error class indan alinir o yuzden super ile kullanilir 

    constructor(message : string, statusCode: number){
        super(message)
        this.statusCode = statusCode;
        this.name = "AppError"
    }
}

// ozel error handler class i tanimladik 