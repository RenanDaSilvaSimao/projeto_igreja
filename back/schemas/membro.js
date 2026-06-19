import {z} from "zod";

export const criarMembroValido = z.object({
    nome: z.string().min(3, "O nome deve ter ao menos 3 caracteres"),
    email: z.email("Formato de e-mail inválido"),
    senha: z.string().min(5, "Senha deve ter ao menos 5 caracteres"),
    cargo: z.string().min(3, "Cargo deve ter ao menos 3 caractres"),
    data_nascimento: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato deve ser AAAA-MM-DD")
        .refine((val) => {
            const data = new Date(val + "T00:00:00")
            const hoje = new Date()
            hoje.setHours(0, 0, 0, 0)
            const minData = new Date(hoje.getFullYear() - 120, hoje.getMonth(), hoje.getDate())
            const maxData = new Date(hoje.getFullYear() + 1, hoje.getMonth(), hoje.getDate())
            return data >= minData && data <= maxData
        }, "Data de nascimento inválida — máximo 120 anos atrás e 1 ano no futuro"),
    telefone: z.string().length(11, "Telefone deve conter 11 caracteres").optional()
});

export const validarLogin = z.object({
    email: z.email("e-mail inválido"),
    senha: z.string().min(5, "senha deve ter ao menos 5 caracteres")
})

export const atualizarMembro = criarMembroValido.partial();