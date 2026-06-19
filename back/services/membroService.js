import * as repository from "../repositories/membroRepository.js";
import { DadoDuplicado, NaoAutorizado, NaoEncontrado } from "../middlewares/errosCustomizados.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { enviarAprovacaoLider } from "../lib/email.js";

export async function cadastrar(dados){

    const buscarEmail = await repository.buscarPorEmail(dados.email);
    if(buscarEmail){
        throw new DadoDuplicado("Email já existe no banco de dados");
    }

    // Líder: NÃO cria no banco agora — codifica os dados no token e envia e-mail
    // O usuário só é criado se o admin clicar em Aprovar
    if(dados.cargo === "Líder"){
        const senhaHash = await bcrypt.hash(dados.senha, 10);

        const tokenAprovacao = jwt.sign(
            {
                _tipo: "aprovacao_lider", // identifica que é um token de cadastro, não de auth
                nome: dados.nome,
                email: dados.email,
                senhaHash,
                cargo: dados.cargo,
                data_nascimento: dados.data_nascimento,
                telefone: dados.telefone || null,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        enviarAprovacaoLider({ nome: dados.nome, email: dados.email, token: tokenAprovacao })
            .catch((err) => console.error("Erro ao enviar e-mail de aprovação:", err));

        return { aguardandoAprovacao: true };
    }

    // Outros cargos: criar normalmente como ativo
    const senhaHash = await bcrypt.hash(dados.senha, 10);
    const newDados = { ...dados, senha: senhaHash, ativo: true };
    return repository.cadastrar(newDados);
}

// Cria o Líder no banco após aprovação — os dados vêm do token do e-mail
export async function criarLiderAprovado(dadosToken){
    // Proteção contra duplo clique no link de aprovação
    const existente = await repository.buscarPorEmail(dadosToken.email);
    if(existente) return existente;

    return repository.cadastrar({
        nome: dadosToken.nome,
        email: dadosToken.email,
        senha: dadosToken.senhaHash, // já hasheada quando o token foi gerado
        cargo: dadosToken.cargo,
        data_nascimento: dadosToken.data_nascimento,
        telefone: dadosToken.telefone,
        ativo: true,
    });
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

    // Líder recém-cadastrado fica inativo até aprovação do admin
    if(!busca.ativo){
        throw new NaoAutorizado("Conta aguardando aprovação do administrador");
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
