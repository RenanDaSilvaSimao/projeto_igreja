import { verificarToken } from "../middlewares/autenticacao.js";
import * as controller from "../controllers/presencaController.js";
import { Router } from "express";

const router = Router();

router.post("/eventos/:id/presencas", verificarToken, controller.cadastrarPresenca);
router.delete("/eventos/:id/presencas", verificarToken, controller.cancelarPresenca);
router.get("/eventos/:id/presencas", verificarToken, controller.listarPresencas);

export default router;