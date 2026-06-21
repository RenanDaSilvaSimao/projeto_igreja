import cors from "cors";
import helmet from "helmet";
import express from "express";
import "dotenv/config";
import routerMembros from "./routes/membrosRoutes.js";
import routerEventos from "./routes/eventosRoutes.js";
import { capturarErro } from "./middlewares/erros.js";
import routerPresencas from "./routes/presencasRoutes.js";

function verificarOrigem(origin, callback) {
  // Sem origem = requisição direta (Postman, Railway health check) — libera
  if (!origin) return callback(null, true);
  // Localhost em desenvolvimento
  if (origin === "http://localhost:5173") return callback(null, true);
  // URL exata configurada no Railway via variável FRONTEND_URL
  if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true);
  // Qualquer subdomínio do Vercel (cobre previews e produção)
  if (origin.endsWith(".vercel.app")) return callback(null, true);

  callback(new Error("Origem não permitida"));
}

const app = express();
app.use(helmet());
app.use(cors({ origin: verificarOrigem }));
app.use(express.json());
app.use(routerMembros);
app.use(routerEventos);
app.use(routerPresencas);
app.use(capturarErro);

app.listen(process.env.PORT || 3000, ()=>{
    console.log(`Servidor rodando na porta ${process.env.PORT||3000}`);
})