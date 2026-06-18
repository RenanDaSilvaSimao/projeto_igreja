import * as presenca from "../repositories/presencasRepository.js";
import * as err from "../middlewares/errosCustomizados.js";
import * as rep from "../repositories/eventoRepository.js";


export async function confirmarPresenca(evento_id, membro_id){
    const busca = await presenca.buscarPresenca(evento_id,membro_id);
    if(busca){
        throw new err.DadoDuplicado("Presenca já confirmada");
    }
    const contador = await presenca.contarPresencas(evento_id);
    const buscarEvento = await rep.buscarPorId(evento_id);
    if(buscarEvento.limite_membros){
    if(Number(contador.quantidade_membros) >= Number(buscarEvento.limite_membros)){
        throw new err.NaoAutorizado("Limite de membros para evento atingido");
    }
    }    
    const confirmado = await presenca.confirmarPresenca(evento_id, membro_id);

    return confirmado; 
}

export async function cancelarPresenca(evento_id, membro_id) {
    const cancelar = await presenca.cancelarPresenca(evento_id,membro_id);
    if(!cancelar){
        throw new err.NaoEncontrado("Presenca não confirmada");
    }
    return cancelar;
}

export async function listarPresencas(evento_id) {
    const listar = await presenca.listarPresencas(evento_id);
    return listar;
}

