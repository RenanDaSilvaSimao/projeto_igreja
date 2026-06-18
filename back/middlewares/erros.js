export function capturarErro(erro, req,res,next){
    console.error(erro)
    if(erro.statusCode){
       return res.status(erro.statusCode).json({erro: erro.message});
    }
    else{
        return res.status(500).json({erro: "Erro do servidor"});
    }
}