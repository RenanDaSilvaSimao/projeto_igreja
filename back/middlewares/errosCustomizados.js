export class NaoEncontrado extends Error{
    constructor(mensagem){
        super(mensagem);
        this.statusCode=404;
    }
}
export class DadoDuplicado extends Error{
    constructor(mensagem){
        super(mensagem);
        this.statusCode=409;
    }
}

export class RequisicaoInvalida extends Error{
    constructor(mensagem){
        super(mensagem);
        this.statusCode=400;
    }
}

export class NaoAutorizado extends Error{
    constructor(mensagem){
        super(mensagem);
        this.statusCode=401;
    }
}