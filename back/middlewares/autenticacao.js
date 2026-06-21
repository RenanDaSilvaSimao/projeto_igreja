import "dotenv/config";
import { NaoAutorizado } from "./errosCustomizados.js";
import jwt from "jsonwebtoken";

export function verificarToken(req,res,next){
    const token = req.headers.authorization;

    if(!token){
        return next(new NaoAutorizado("Token inválido/ausente"));
    }
    try{
        const tokenArr = token.split(" ");
        const tokenReal = tokenArr.length>1?tokenArr[1]:tokenArr[0];
        const tokenVerificado = jwt.verify(tokenReal, process.env.JWT_SECRET);
        req.usuario = tokenVerificado;
        next();
    }catch(erro){
        next(new NaoAutorizado("Token inválido ou expirado"));
    }
}