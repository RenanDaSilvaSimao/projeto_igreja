import * as repository from "../repositories/membroRepository.js";
import { DadoDuplicado, NaoAutorizado, NaoEncontrado } from "../middlewares/errosCustomizados.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { th } from "zod/v4/locales";

export async function cadastrar(dados){

    const buscarEmail = await repository.buscarPorEmail(dados.email);
    if(buscarEmail){
        throw new DadoDuplicado("Email já existe no banco de dados");
    }

    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const newDados = {
        ...dados,
        senha: senhaHash
    }

    const conexao = await repository.cadastrar(newDados);
    return conexao;
}

export async function atualizar(dados, id){
    const busca = await repository.buscarPorId(id);
    if(!busca){
        throw new NaoEncontrado("membro não encontrado");
    }

    const newDados = {
        ...busca,
        ...dados
    }

    const att = await repository.atualizar(newDados, id);

    return att;

}

export async function listarTodos(){
    const listagem = await repository.listarTodos();

    return listagem;
    
}

export async function buscarPorId(id){
    const busca = await repository.buscarPorId(id);

    if(!busca){
        throw new NaoEncontrado("membro não encontrado");
    }

    return busca;
}

export async function deletar(id){
    const del = await repository.deletar(id);
    if(!del){
        throw new NaoEncontrado("membro para deletar não encontrado");
    }

    return del;
}

export async function login(dados){
    const busca = await repository.buscarPorEmail(dados.email);
    if(!busca){
        throw new NaoEncontrado("membro não cadastrado");
    }

    const compararSenha = await bcrypt.compare(dados.senha, busca.senha);

    if(!compararSenha){
        throw new NaoAutorizado("Senha incorreta");
    }

    const token = jwt.sign({id: busca.id}, process.env.JWT_SECRET, {expiresIn: "7d"});

    // Retorna o token E o cargo para o front-end saber as permissões do usuário
    return { token, cargo: busca.cargo };
}

export async function buscarComFiltros(filtros){
    const conexao = await repository.buscarComFiltros(filtros);  
    return conexao;
}
