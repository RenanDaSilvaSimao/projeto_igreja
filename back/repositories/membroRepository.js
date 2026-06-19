import {pool} from "../db.js";

export async function cadastrar(dados){
    // ativo pode vir como false para Líderes que precisam de aprovação
    const insercao = await pool.query(
        "INSERT INTO membros (nome,email,senha,cargo,data_nascimento,telefone,ativo) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *;",
        [dados.nome, dados.email, dados.senha, dados.cargo, dados.data_nascimento, dados.telefone, dados.ativo ?? true]
    );

    return insercao.rows[0];
}

// Ativa um membro que estava aguardando aprovação
export async function ativar(id){
    const conexao = await pool.query("UPDATE membros SET ativo = true WHERE id = $1 RETURNING *;", [id]);
    return conexao.rows[0];
}

export async function listarTodos(){
    const listagem = await pool.query("SELECT * FROM membros;");
    return listagem.rows;
}

export async function buscarPorId(id){
    const busca = await pool.query("SELECT * FROM membros WHERE id = $1",[id]);
    return busca.rows[0];
}

export async function buscarPorEmail(email){
    const conexao = await pool.query("SELECT * FROM membros WHERE email = $1;",[email]);
    return conexao.rows[0];
}

export async function atualizar(dados, id){
    const conexao = await pool.query("UPDATE membros SET nome=$1,email=$2,senha=$3,cargo=$4,data_nascimento=$5,telefone=$6 WHERE id =$7 RETURNING *;", [dados.nome,dados.email,dados.senha,dados.cargo,dados.data_nascimento,dados.telefone, id]);
    return conexao.rows[0];
}

export async function deletar(id){
    const conexao = await pool.query("DELETE FROM membros WHERE id =$1 RETURNING *;",[id]);
    return conexao.rows[0];
}

export async function buscarComFiltros(filtro){
const condicoes = [];
const valores = [];

if(filtro.cargo){
    condicoes.push(`cargo = $${condicoes.length +1}`);
    valores.push(filtro.cargo);
}
if(filtro.ativo!==undefined){
    condicoes.push(`ativo = $${condicoes.length+1}`);
    valores.push(filtro.ativo);
}
if(filtro.nome){
    condicoes.push(`nome = $${condicoes.length+1}`);
    valores.push(filtro.nome);
}

const where = condicoes.length>0? `WHERE ${condicoes.join(" AND ")}`:"";

console.log(where);
const conexao = await pool.query(`SELECT * FROM membros ${where};`,valores);

return conexao.rows;
}



