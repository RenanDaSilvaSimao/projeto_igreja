import * as repository from "../repositories/eventoRepository.js";
import * as presencasRepository from "../repositories/presencasRepository.js";
import * as err from "../middlewares/errosCustomizados.js";

export async function criarEvento(dados){
    if(!dados){
        throw new err.RequisicaoInvalida("Sem dados para inserir");
    }

    const verificar = await repository.buscarPorDataELocal(dados.data_evento, dados.local_evento);
    if(verificar.length >0){
        throw new err.DadoDuplicado("Já tem um evento nesta data e neste local");
    }

    const conexao = await repository.cadastrar(dados);

    return conexao;
}

export async function listarTodos(membro_id){
    const conexao = await repository.buscarTodos(membro_id);
    return conexao;
}

export async function buscarPorId(id){
    const conexao = await repository.buscarPorId(id);
    if(!conexao){
        throw new err.NaoEncontrado("não encontrado");
    }

    return conexao;
    
}

export async function remover(id){
    await presencasRepository.deletarPorEvento(id);

    const conexao = await repository.remover(id);
    if(!conexao){
        throw new err.NaoEncontrado("não encontrado");
    }

    return conexao;
}

export async function atualizar(dados, id){
    const buscarId = await buscarPorId(id);

    const novo = {...buscarId, ...dados}

    const conexao = await repository.atualizar(novo, id);

    return conexao;
}

export async function buscarComFiltros(filtros) {
    const conexao = await repository.buscarComFiltros(filtros);
    return conexao;
}


