import * as service from "../services/presencaServices.js";

export async function cadastrarPresenca(req, res, next){
    try{
        const tokenId = Number(req.usuario.id);
        const evento_id = Number(req.params.id);
        const confirmar = await service.confirmarPresenca(evento_id, tokenId);
        return res.status(201).json(confirmar);
    }catch(erro){
        next(erro);
    }
}

export async function cancelarPresenca(req,res,next){
    try{    
        const tokenId = Number(req.usuario.id);
        const evento_id = Number(req.params.id);
        const cancelado = await service.cancelarPresenca(evento_id, tokenId);
        return res.status(200).json(cancelado);
    }catch(erro){
        next(erro);
    }
}

export async function listarPresencas(req,res,next) {
    try{
        const evento_id = Number(req.params.id);
        const listagem = await service.listarPresencas(evento_id);
        return res.status(200).json(listagem);
    }catch(erro){
        next(erro);
    }
}