import * as service from "../services/contribuicaoService.js";
import { registrarContribuicaoValido } from "../schemas/contribuicao.js";

export async function status(req, res, next) {
    try {
        const resultado = await service.calcularStatus(req.usuario.id);
        return res.status(200).json(resultado);
    } catch (erro) {
        next(erro);
    }
}

export async function registrar(req, res, next) {
    try {
        const { valor } = registrarContribuicaoValido.parse(req.body);
        const resultado = await service.registrar(req.usuario.id, valor);
        return res.status(201).json(resultado);
    } catch (erro) {
        next(erro);
    }
}

export async function listar(req, res, next) {
    try {
        const mes = Number(req.query.mes) || new Date().getMonth() + 1;
        const ano = Number(req.query.ano) || new Date().getFullYear();
        const lista = await service.listar(mes, ano);
        return res.status(200).json(lista);
    } catch (erro) {
        next(erro);
    }
}
