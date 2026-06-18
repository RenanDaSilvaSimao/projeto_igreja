import {pool} from "../db.js";


export async function cadastrar(dados){
    const {nome_evento, data_evento, local_evento, limite_membros} = dados;
    const conexao = await pool.query("INSERT INTO eventos (nome_evento,data_evento,local_evento,limite_membros) VALUES ($1,$2,$3,$4) RETURNING *;",
        [nome_evento, data_evento, local_evento, limite_membros]
    );

    return conexao.rows[0];
}

export async function buscarComFiltros(filtros){
    const condicoes = [];
    const valores = [];
    if(filtros.nome_evento){
        valores.push(filtros.nome_evento);
        condicoes.push(`nome_evento=$${condicoes.length+1}`);
    }
    if(filtros.data_evento){
        valores.push(filtros.data_evento);
        condicoes.push(`data_evento=$${condicoes.length+1}`);
    }
    if(filtros.local_evento){
        valores.push(filtros.local_evento);
        condicoes.push(`local_evento=$${condicoes.length+1}`);
    }
    if(filtros.limite_membros){
        valores.push(filtros.limite_membros);
        condicoes.push(`limite_membros=$${condicoes.length+1}`);
    }

    const where = condicoes.length>0? `WHERE ${condicoes.join(" AND ")}`:"";

    const conexao = await pool.query(`SELECT * FROM eventos ${where};`,valores);

    return conexao.rows;
}

export async function buscarPorDataELocal(data,local){
    const conexao = await pool.query("SELECT * FROM eventos WHERE data_evento =$1 AND local_evento =$2;",
        [data, local]
    );
    return conexao.rows;
}


export async function buscarPorId(id){
    const conexao = await pool.query("SELECT * FROM eventos WHERE id = $1;",[id]);
    return conexao.rows[0];
}

export async function buscarTodos(){
    const conexao = await pool.query("SELECT * FROM eventos;");
    return conexao.rows;
}


export async function remover(id){
    const conexao = await pool.query("DELETE FROM eventos WHERE id = $1 RETURNING *;",[id]);
    return conexao.rows[0];
}

export async function atualizar(dados, id){
    const conexao = await pool.query("UPDATE eventos SET nome_evento=$1,data_evento=$2,local_evento=$3,limite_membros=$4 WHERE id=$5 RETURNING*;",
        [dados.nome_evento, dados.data_evento,dados.local_evento, dados.limite_membros, id]
    );
    return conexao.rows[0];
}





