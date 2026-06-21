import * as membroRepository from "../repositories/membroRepository.js";
import { NaoAutorizado } from "./errosCustomizados.js";

const CARGOS_PRIVILEGIADOS = ["Pastor Presidente", "Vice Presidente"];

export async function verificarLider(req, res, next) {
  try {
    const membro = await membroRepository.buscarPorId(req.usuario.id);
    if (!membro || !CARGOS_PRIVILEGIADOS.includes(membro.cargo)) {
      throw new NaoAutorizado("Apenas Pastor Presidente ou Vice Presidente podem realizar esta ação");
    }
    next();
  } catch (erro) {
    next(erro);
  }
}
