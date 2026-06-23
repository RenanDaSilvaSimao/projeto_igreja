import { z } from "zod";

export const registrarContribuicaoValido = z.object({
    valor: z.number()
        .min(1, "Valor mínimo é R$1")
        .max(500, "Valor máximo por contribuição é R$500")
});
