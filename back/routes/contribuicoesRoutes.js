import { Router } from "express";
import * as controller from "../controllers/contribuicaoController.js";
import { verificarToken } from "../middlewares/autenticacao.js";
import { verificarLider } from "../middlewares/verificarLider.js";

const router = Router();

// Status do mês atual — qualquer membro logado pode ver
router.get("/contribuicoes/status", verificarToken, controller.status);

// Registrar contribuição — qualquer membro logado
router.post("/contribuicoes", verificarToken, controller.registrar);

// Listar contribuições com nomes — apenas cargos privilegiados
router.get("/contribuicoes", verificarToken, verificarLider, controller.listar);

export default router;
