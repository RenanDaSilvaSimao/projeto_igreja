import * as repository from "../repositories/contribuicaoRepository.js";
import { DadoDuplicado, RequisicaoInvalida } from "../middlewares/errosCustomizados.js";

const META = 100;
const MESES_PARA_BLOQUEAR = 3;

// Calcula o status do mês atual com carry-over de surplus e detecção de bloqueio
export async function calcularStatus(membro_id) {
    const agora = new Date();
    const mesAtual = agora.getMonth() + 1;
    const anoAtual = agora.getFullYear();

    // Busca os últimos 4 meses COMPLETOS + mês atual (total 5 registros possíveis)
    // 4 meses é suficiente para detectar 3 consecutivos e calcular surplus
    const totaisBanco = await repository.buscarTotaisUltimosMeses(anoAtual, mesAtual, 5);

    // Monta array dos 4 meses completos anteriores, preenchendo com 0 se sem contribuições
    const mesesCompletos = [];
    for (let i = 4; i >= 1; i--) {
        const data = new Date(anoAtual, mesAtual - 1 - i, 1);
        const mes = data.getMonth() + 1;
        const ano = data.getFullYear();
        const encontrado = totaisBanco.find(t => Number(t.mes) === mes && Number(t.ano) === ano);
        mesesCompletos.push({ mes, ano, total: encontrado ? parseFloat(encontrado.total) : 0 });
    }

    // Percorre os meses completos calculando surplus e falhas consecutivas
    let surplusAnterior = 0;
    let mesesConsecutivosFalhos = 0;

    for (const { total } of mesesCompletos) {
        const efetivo = total + surplusAnterior;
        if (efetivo >= META) {
            surplusAnterior = parseFloat((efetivo - META).toFixed(2));
            mesesConsecutivosFalhos = 0;
        } else {
            surplusAnterior = 0;
            mesesConsecutivosFalhos++;
        }
    }

    const bloqueado = mesesConsecutivosFalhos >= MESES_PARA_BLOQUEAR;

    // Total arrecadado no mês atual
    const registroAtual = totaisBanco.find(
        t => Number(t.mes) === mesAtual && Number(t.ano) === anoAtual
    );
    const totalMesAtual = registroAtual ? parseFloat(registroAtual.total) : 0;
    const efetivo = parseFloat((totalMesAtual + surplusAnterior).toFixed(2));

    // Verifica se o membro logado já contribuiu este mês
    const minhaContribuicao = await repository.buscarContribuicaoMembro(membro_id, mesAtual, anoAtual);

    return {
        totalMes: totalMesAtual,
        surplusAnterior,
        efetivo,
        meta: META,
        faltam: parseFloat(Math.max(0, META - efetivo).toFixed(2)),
        atingida: efetivo >= META,
        bloqueado,
        mesesConsecutivosFalhos,
        jaContribuiu: !!minhaContribuicao,
        minhaContribuicao: minhaContribuicao ? parseFloat(minhaContribuicao.valor) : null,
    };
}

export async function registrar(membro_id, valor) {
    const agora = new Date();
    const mes = agora.getMonth() + 1;
    const ano = agora.getFullYear();

    // Garante que o membro não contribuiu duas vezes no mesmo mês
    const existente = await repository.buscarContribuicaoMembro(membro_id, mes, ano);
    if (existente) {
        throw new DadoDuplicado("Você já registrou uma contribuição este mês");
    }

    return repository.registrar(membro_id, valor, mes, ano);
}

export async function listar(mes, ano) {
    return repository.listarComMembros(mes, ano);
}
