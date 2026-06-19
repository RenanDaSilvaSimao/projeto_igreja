import {z} from "zod";

export const criarEventoValido = z.object({
    nome_evento: z.string().min(3, "O Nome deve ter ao menos 3 caracteres"),
    data_evento: z.string()
        .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, "Formato deve ser YYYY-MM-DD HH:MM")
        .refine((val) => {
            const dataEvento = new Date(val.replace(" ", "T"));
            return dataEvento > new Date();
        }, "O evento deve ser agendado para uma data/hora futura"),
    local_evento: z.string().min(3, "O local deve ter ao menos 3 caracteres"),
    limite_membros: z.number().int().optional()

});

export const alterarEventoValido = criarEventoValido.partial();