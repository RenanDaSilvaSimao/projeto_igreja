import {Router} from "express";
import * as controller from "../controllers/eventoController.js";

const router = Router();

router.get("/eventos/relatorio", controller.relatorio);
router.get("/eventos", controller.listarTodos);
router.get("/eventos/:id", controller.buscarPorId);
router.post("/eventos", controller.criarEvento);
router.patch("/eventos/:id", controller.atualizar);
router.delete("/eventos/:id", controller.remover);

export default router;