import { pool } from "../db.js";

// Registra a contribuição do membro para o mês/ano atual
export async function registrar(membro_id, valor, mes, ano) {
    const res = await pool.query(
        "INSERT INTO contribuicoes (membro_id, valor, mes, ano) VALUES ($1,$2,$3,$4) RETURNING *;",
        [membro_id, valor, mes, ano]
    );
    return res.rows[0];
}

// Busca a contribuição de um membro específico em um mês/ano
export async function buscarContribuicaoMembro(membro_id, mes, ano) {
    const res = await pool.query(
        "SELECT * FROM contribuicoes WHERE membro_id=$1 AND mes=$2 AND ano=$3;",
        [membro_id, mes, ano]
    );
    return res.rows[0];
}

// Retorna totais agrupados por mes/ano dos últimos N meses (incluindo o atual)
export async function buscarTotaisUltimosMeses(anoAtual, mesAtual, quantidade) {
    const res = await pool.query(`
        SELECT mes, ano, SUM(valor)::numeric AS total
        FROM contribuicoes
        WHERE (ano * 12 + mes) >= ($1 * 12 + $2 - $3 + 1)
          AND (ano * 12 + mes) <= ($1 * 12 + $2)
        GROUP BY mes, ano
        ORDER BY ano ASC, mes ASC;
    `, [anoAtual, mesAtual, quantidade]);
    return res.rows;
}

// Lista todas as contribuições de um mês/ano com nome do membro — visível só para admins
export async function listarComMembros(mes, ano) {
    const res = await pool.query(`
        SELECT c.id, c.valor, c.criado_em, m.nome, m.cargo
        FROM contribuicoes c
        INNER JOIN membros m ON m.id = c.membro_id
        WHERE c.mes = $1 AND c.ano = $2
        ORDER BY c.criado_em DESC;
    `, [mes, ano]);
    return res.rows;
}
