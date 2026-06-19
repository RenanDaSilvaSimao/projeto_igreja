import * as service from "../services/membroService.js";
import { criarMembroValido, atualizarMembro, validarLogin, alterarAtivoValido } from "../schemas/membro.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

export async function cadastrar(req,res,next){
    try{
        const dados = criarMembroValido.parse(req.body);
        const cadastro = await service.cadastrar(dados);
        return res.status(201).json(cadastro);

    }catch(erro){
        next(erro);
    }
}

export async function listarTodos(req,res,next){
    try{
        const listagem = await service.listarTodos();
        return res.status(200).json(listagem);
    }catch(erro){
        next(erro);
    }
}

export async function buscarPorId(req,res,next){
    try{
        const id= Number(req.params.id);
        const busca = await service.buscarPorId(id);
        return res.status(200).json(busca);
    }catch(erro){
        next(erro);
    }
}

export async function deletar(req,res,next){
    try{
        const id= Number(req.params.id);
        const delet = await service.deletar(id);
        return res.status(200).json(delet);
    }catch(erro){
        next(erro);
    }
}

export async function atualizar(req,res,next){
    try{
        const id = Number(req.params.id);
        const dados = atualizarMembro.parse(req.body);
        const att = await service.atualizar(dados, id);
        return res.status(200).json(att);
    }catch(erro){
        next(erro);
    }
}

export async function login(req,res,next){
    try{
        const dados = validarLogin.parse(req.body);
        const receberToken = await service.login(dados);
        return res.status(200).json(receberToken);

    }catch(erro){
        next(erro);
    }
}

// Ativado pelo link "Aprovar" — cria o Líder no banco com os dados do token
export async function aprovar(req, res, next) {
    try {
        const payload = jwt.verify(req.params.token, process.env.JWT_SECRET);

        if(payload._tipo !== "aprovacao_lider"){
            return res.status(400).send(`<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:60px"><h1>Link inválido</h1></body></html>`);
        }

        await service.criarLiderAprovado(payload);
        return res.send(`<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:60px">
            <h1 style="color:#c85a00">✅ Líder aprovado!</h1>
            <p><strong>${payload.nome}</strong> foi cadastrado e já pode acessar o sistema.</p>
        </body></html>`);
    } catch (erro) {
        if (erro.name === "JsonWebTokenError" || erro.name === "TokenExpiredError") {
            return res.status(400).send(`<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:60px"><h1>Link inválido ou expirado</h1></body></html>`);
        }
        next(erro);
    }
}

// Ativado pelo link "Negar" — não há nada a deletar, o usuário nunca foi criado
export async function negar(req, res, next) {
    try {
        const payload = jwt.verify(req.params.token, process.env.JWT_SECRET);

        return res.send(`<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:60px">
            <h1 style="color:#c0392b">❌ Cadastro negado</h1>
            <p>O pedido de <strong>${payload.nome || "usuário"}</strong> foi recusado. Nenhum dado foi salvo.</p>
        </body></html>`);
    } catch (erro) {
        if (erro.name === "JsonWebTokenError" || erro.name === "TokenExpiredError") {
            return res.status(400).send(`<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:60px"><h1>Link inválido ou expirado</h1></body></html>`);
        }
        next(erro);
    }
}

export async function alternarAtivo(req, res, next) {
    try {
        const id = Number(req.params.id);
        const { ativo } = alterarAtivoValido.parse(req.body);
        const resultado = await service.alternarAtivo(id, ativo);
        return res.status(200).json(resultado);
    } catch (erro) {
        next(erro);
    }
}

export async function relatorio(req,res,next){
    try{
        const filtros = req.query;
        if(filtros.ativo){
        filtros.ativo = filtros.ativo==="true";
        }
        const cs = await service.buscarComFiltros(filtros);
        return res.status(200).json(cs);
    }catch(erro){
        next(erro);
    }
}

