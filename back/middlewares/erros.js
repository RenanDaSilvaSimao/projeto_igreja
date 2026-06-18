import { ZodError } from "zod";
export function capturarErro(erro, req,res,next){
    if(erro instanceof ZodError){
        return res.status(400).json({erro: erro.message});
    }
    if(erro.statusCode){
       return res.status(erro.statusCode).json({erro: erro.message});
    }
    else{
        return res.status(500).json({erro: "Erro do servidor"});
    }
}