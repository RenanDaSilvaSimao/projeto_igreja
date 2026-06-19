import * as service from "../services/eventoService.js";
import * as schema from "../schemas/eventos.js";

export async function buscarPorId(req,res,next){
    try{
        const id = Number(req.params.id);
        const busca = await service.buscarPorId(id);
        return res.status(200).json(busca);

    }catch(err){
        next(err);
    }
}

export async function listarTodos(req,res,next){
    try{
        const listagem = await service.listarTodos(req.usuario.id);
        return res.status(200).json(listagem);
    }catch(err){
        next(err);
    }
}

export async function criarEvento(req,res,next){
    try{
        const dados = schema.criarEventoValido.parse(req.body);
        const conexao = await service.criarEvento(dados);
        return res.status(201).json(conexao);
    }catch(err){
        next(err);
    }
}

export async function atualizar(req,res,next){
    try{
        const id = Number(req.params.id);
        const dados = schema.alterarEventoValido.parse(req.body);
        const conexao = await service.atualizar(dados, id);
        return res.status(200).json(conexao);
    }catch(err){
        next(err);
    }
}

    
export async function remover(req,res,next){
    try{
        const id = Number(req.params.id);
        const conexao = await service.remover(id);
        return res.status(204).json(conexao);
    }catch(err){
        next(err);
    }
}

export async function relatorio(req,res,next){
    try{
        const filtros = req.query;
        const conexao = await service.buscarComFiltros(filtros);
        return res.status(200).json(conexao);
    }catch(err){
        next(err);
    }
}





