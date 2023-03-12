import { CUSTOM_VALIDATION } from "@src/models/user";
import { Response } from "express";
import mongoose from "mongoose";


export abstract class BaseController {
    protected sendCreatedUpdateErrorResponse(res: Response, error: mongoose.Error.ValidationError | any ):void{
        if(error instanceof mongoose.Error.ValidationError){
            const clientsErros = this.heandleClientErros(error)
            res.status(clientsErros.code).send({code:clientsErros.code, error: clientsErros.error})
            return
        }
        res.status(500).send({code:500, error: 'Somethig went wrong!'})

    }

    private heandleClientErros(error: mongoose.Error.ValidationError):{code:number, error:string}{

        const dublicatedKindErros = Object.values(error.errors).filter((err)=> err.kind == CUSTOM_VALIDATION.DUPLICATED)
        if(dublicatedKindErros.length){
         return {code:409, error: error.message}
        }
        return {code:422, error: error.message}
        

      
    }
}