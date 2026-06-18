import {Router} from "express";
import * as controller from "../controllers/membroController.js";
import { verificarToken } from "../middlewares/autenticacao.js";

const router = Router();

router.get("/membros", verificarToken, controller.listarTodos);
router.get("/membros/relatorio", verificarToken, controller.relatorio);
router.get("/membros/:id", verificarToken, controller.buscarPorId);
router.post("/membros", controller.cadastrar);
router.delete("/membros/:id", verificarToken, controller.deletar);
router.patch("/membros/:id", verificarToken, controller.atualizar);
router.post("/membros/login", controller.login);

export default router;