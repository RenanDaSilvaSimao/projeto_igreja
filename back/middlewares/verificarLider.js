import * as membroRepository from "../repositories/membroRepository.js";
import { NaoAutorizado } from "./errosCustomizados.js";

export async function verificarLider(req, res, next) {
  try {
    const membro = await membroRepository.buscarPorId(req.usuario.id);
    if (!membro || membro.cargo !== "Líder") {
      throw new NaoAutorizado("Apenas Líderes podem realizar esta ação");
    }
    next();
  } catch (erro) {
    next(erro);
  }
}
