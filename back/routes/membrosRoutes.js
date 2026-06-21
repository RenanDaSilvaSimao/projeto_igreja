import {Router} from "express";
import rateLimit from "express-rate-limit";
import * as controller from "../controllers/membroController.js";
import { verificarToken } from "../middlewares/autenticacao.js";
import { verificarLider } from "../middlewares/verificarLider.js";

// Bloqueia o IP após 10 tentativas de login em 15 minutos
const limitadorLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { mensagem: "Muitas tentativas de login. Tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.get("/membros", verificarToken, controller.listarTodos);
router.get("/membros/relatorio", verificarToken, controller.relatorio);
// Rotas públicas acionadas pelos links do e-mail — o JWT no parâmetro é a autenticação
router.get("/membros/aprovar/:token", controller.aprovar);
router.get("/membros/negar/:token", controller.negar);
router.get("/membros/:id", verificarToken, controller.buscarPorId);
router.post("/membros", controller.cadastrar);
router.delete("/membros/:id", verificarToken, verificarLider, controller.deletar);
router.patch("/membros/:id/ativo", verificarToken, verificarLider, controller.alternarAtivo);
router.patch("/membros/:id", verificarToken, controller.atualizar);
router.post("/membros/login", limitadorLogin, controller.login);

export default router;