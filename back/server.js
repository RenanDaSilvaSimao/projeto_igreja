import cors from "cors";
import helmet from "helmet";
import express from "express";
import "dotenv/config";
import routerMembros from "./routes/membrosRoutes.js";
import routerEventos from "./routes/eventosRoutes.js";
import { capturarErro } from "./middlewares/erros.js";
import routerPresencas from "./routes/presencasRoutes.js";

// Aceita requisições do front em produção (FRONTEND_URL no Railway) e do localhost em dev
const origensPermitidas = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

const app = express();
app.use(helmet());
app.use(cors({ origin: origensPermitidas }));
app.use(express.json());
app.use(routerMembros);
app.use(routerEventos);
app.use(routerPresencas);
app.use(capturarErro);

app.listen(process.env.PORT || 3000, ()=>{
    console.log(`Servidor rodando na porta ${process.env.PORT||3000}`);
})