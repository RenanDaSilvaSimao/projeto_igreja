import {Router} from "express";
import * as controller from "../controllers/eventoController.js";
import { verificarToken } from "../middlewares/autenticacao.js";
import { verificarLider } from "../middlewares/verificarLider.js";

const router = Router();

router.get("/eventos/relatorio", verificarToken, controller.relatorio);
router.get("/eventos", verificarToken, controller.listarTodos);
router.get("/eventos/:id", verificarToken, controller.buscarPorId);
router.post("/eventos", verificarToken, verificarLider, controller.criarEvento);
router.patch("/eventos/:id", verificarToken, verificarLider, controller.atualizar);
router.delete("/eventos/:id", verificarToken, verificarLider, controller.remover);

export default router;