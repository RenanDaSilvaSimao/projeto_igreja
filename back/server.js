import cors from "cors";
import express from "express";
import "dotenv/config";
import routerMembros from "./routes/membrosRoutes.js";
import routerEventos from "./routes/eventosRoutes.js";
import { capturarErro } from "./middlewares/erros.js";
import routerPresencas from "./routes/presencasRoutes.js";


const app = express();
app.use(express.json());
app.use(cors());
app.use(routerMembros);
app.use(routerEventos);
app.use(routerPresencas);
app.use(capturarErro);

app.listen(process.env.PORT || 3000, ()=>{
    console.log(`Servidor rodando na porta ${process.env.PORT||3000}`);
})