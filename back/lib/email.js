import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// URL pública do back-end no Railway — usada nos links do e-mail
const BACKEND_URL = "https://projetoigreja-production-1a53.up.railway.app"

// Envia e-mail para o admin pedindo aprovação de um novo membro privilegiado
export async function enviarAprovacaoLider({ nome, email, cargo, token }) {
  const linkAprovar = `${BACKEND_URL}/membros/aprovar/${token}`
  const linkNegar   = `${BACKEND_URL}/membros/negar/${token}`

  await resend.emails.send({
    from: "AD Fogo Para As Nações <onboarding@resend.dev>",
    to:   "renan.simao360@gmail.com",
    subject: `Novo cadastro aguardando aprovação — ${nome} (${cargo})`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
        <h2 style="color:#1a3a2a;margin-top:0">Novo cadastro aguardando aprovação</h2>
        <p>O membro abaixo se cadastrou como <strong>${cargo}</strong> e aguarda sua aprovação para acessar o sistema.</p>

        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr>
            <td style="color:#666;padding:6px 0;width:80px">Nome</td>
            <td><strong>${nome}</strong></td>
          </tr>
          <tr>
            <td style="color:#666;padding:6px 0">E-mail</td>
            <td>${email}</td>
          </tr>
          <tr>
            <td style="color:#666;padding:6px 0">Cargo</td>
            <td><strong>${cargo}</strong></td>
          </tr>
        </table>

        <div style="margin-top:28px">
          <a href="${linkAprovar}"
             style="background:#1a7a4a;color:#fff;text-decoration:none;padding:13px 26px;border-radius:6px;font-weight:bold;display:inline-block;margin-right:12px">
            ✅ Aprovar
          </a>
          <a href="${linkNegar}"
             style="background:#c0392b;color:#fff;text-decoration:none;padding:13px 26px;border-radius:6px;font-weight:bold;display:inline-block">
            ❌ Negar
          </a>
        </div>

        <p style="margin-top:32px;color:#999;font-size:12px">
          Este link expira em 7 dias. — AD Fogo Para As Nações
        </p>
      </div>
    `,
  })
}
