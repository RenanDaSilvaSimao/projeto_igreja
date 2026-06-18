import {z} from "zod";

export const criarEventoValido = z.object({
    nome_evento: z.string().min(3, "O Nome deve ter ao menos 3 caracteres"),
    data_evento: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, "Formato deve ser YYYY-MM-DD HH:MM"),
    local_evento: z.string().min(3, "O local deve ter ao menos 3 caracteres"),
    limite_membros: z.number().int().optional()

});

export const alterarEventoValido = criarEventoValido.partial();