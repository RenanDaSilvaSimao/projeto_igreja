import { pool } from "../db.js";

export async function confirmarPresenca(evento_id, membro_id) {
    const inserir = await pool.query("INSERT INTO presencas (evento_id, membro_id) VALUES ($1,$2) RETURNING *;",
        [evento_id, membro_id]
    );

    return inserir.rows[0];
}

export async function buscarPresenca(evento_id,membro_id){
    const busca = await pool.query("SELECT * FROM presencas WHERE evento_id= $1 AND membro_id =$2;",[evento_id, membro_id]);
    return busca.rows[0];
}
export async function contarPresencas(evento_id){
    const contador = await pool.query("SELECT COUNT(*) AS quantidade_membros from presencas WHERE evento_id=$1;",[evento_id]);
    return contador.rows[0];
}

export async function cancelarPresenca(evento_id, membro_id){
    const deletado = await pool.query("DELETE FROM presencas WHERE evento_id = $1 AND membro_id = $2 RETURNING *;",
        [evento_id, membro_id]
    );
    return deletado.rows[0];
}
export async function listarPresencas(evento_id){
    const conexao = await pool.query("SELECT m.nome, p.evento_id, p.membro_id FROM presencas p INNER JOIN membros m ON p.membro_id = m.id WHERE evento_id=$1;",[evento_id]);
    return conexao.rows;
}

export async function deletarPorMembro(membro_id){
    await pool.query("DELETE FROM presencas WHERE membro_id = $1;", [membro_id]);
}

export async function deletarPorEvento(evento_id){
    await pool.query("DELETE FROM presencas WHERE evento_id = $1;", [evento_id]);
}

