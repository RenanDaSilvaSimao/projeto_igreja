import { createFileRoute, useNavigate, Link } from "@tanstack/react-router"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { cadastrarMembro } from "@/lib/api"

export const Route = createFileRoute("/_app/membros/novo")({
  component: NovoMembroPage,
})

function NovoMembroPage() {
  const navigate = useNavigate()

  // Estado do formulário — campos que o back-end espera
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    cargo: "Membro",
    data_nascimento: "", // formato YYYY-MM-DD (vem do input type="date")
    telefone: "",        // 11 dígitos sem formatação: "11987654321"
  })
  const [carregando, setCarregando] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setCarregando(true)
    try {
      // Monta os dados — remove telefone se estiver vazio (campo opcional)
      const dados = { ...form }
      if (!dados.telefone) delete dados.telefone

      await cadastrarMembro(dados)
      toast.success("Membro cadastrado com sucesso!")
      navigate({ to: "/membros" })
    } catch (erro) {
      toast.error(erro.message)
    } finally {
      setCarregando(false)
    }
  }

  // Atualiza um campo específico do formulário sem perder os outros
  const set = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }))

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link to="/membros"><ArrowLeft className="h-4 w-4" /> Voltar</Link>
        </Button>
        <h1 className="text-3xl">Novo membro</h1>
        <p className="text-muted-foreground">Adicione uma nova pessoa à comunidade.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input id="nome" required value={form.nome} onChange={(e) => set("nome", e.target.value)} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input id="senha" type="password" required minLength={5} value={form.senha} onChange={(e) => set("senha", e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Select value={form.cargo} onValueChange={(v) => set("cargo", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Membro">Membro</SelectItem>
                    <SelectItem value="Líder">Líder</SelectItem>
                    <SelectItem value="Diácono">Diácono</SelectItem>
                    <SelectItem value="Pastor">Pastor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de nascimento</Label>
                {/* type="date" retorna string no formato YYYY-MM-DD — exatamente o que o back-end espera */}
                <Input id="data_nascimento" type="date" required value={form.data_nascimento} onChange={(e) => set("data_nascimento", e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone <span className="text-muted-foreground text-xs">(opcional — 11 dígitos sem formatação)</span></Label>
              <Input
                id="telefone"
                value={form.telefone}
                onChange={(e) => set("telefone", e.target.value.replace(/\D/g, ""))} // remove não-dígitos
                maxLength={11}
                placeholder="11987654321"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button asChild type="button" variant="outline">
                <Link to="/membros">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={carregando}>
                {carregando ? "Salvando..." : "Salvar membro"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
