import { ZodError } from "zod";
export function capturarErro(erro, req,res,next){
    if(erro instanceof ZodError){
        return res.status(400).json({ mensagem: erro.errors.map(e=>e.message).join(", ") });
    }
    if(erro.statusCode){
        return res.status(erro.statusCode).json({ mensagem: erro.message });
    }
    return res.status(500).json({ mensagem: "Erro interno do servidor" });
}