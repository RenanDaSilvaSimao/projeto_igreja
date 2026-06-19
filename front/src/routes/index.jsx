import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Church } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { login, cadastrarMembro } from "@/lib/api"

export const Route = createFileRoute("/")({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()

  // ─── Estado: login ────────────────────────────────────────────────────────
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [carregandoLogin, setCarregandoLogin] = useState(false)

  // ─── Estado: cadastro ─────────────────────────────────────────────────────
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    cargo: "Membro",
    data_nascimento: "",
    telefone: "",
  })
  const [carregandoCadastro, setCarregandoCadastro] = useState(false)

  const set = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }))

  // Faz login e redireciona para o painel
  const fazerLogin = async (emailParam, senhaParam) => {
    const dados = await login(emailParam, senhaParam)
    // Salva token e cargo — cargo é usado para checar permissões (ex: deletar evento)
    localStorage.setItem("token", dados.token)
    localStorage.setItem("cargo", dados.cargo)
    navigate({ to: "/dashboard" })
  }

  const onLogin = async (e) => {
    e.preventDefault()
    setCarregandoLogin(true)
    try {
      await fazerLogin(email, senha)
    } catch (erro) {
      toast.error(erro.message)
    } finally {
      setCarregandoLogin(false)
    }
  }

  // Cadastra o membro e já faz login automático com as mesmas credenciais
  const onCadastrar = async (e) => {
    e.preventDefault()
    setCarregandoCadastro(true)
    try {
      const dados = { ...form }
      if (!dados.telefone) delete dados.telefone

      // 1. Cria o membro no banco
      await cadastrarMembro(dados)

      // 2. Faz login automático com as credenciais recém-cadastradas
      toast.success("Conta criada! Entrando...")
      await fazerLogin(form.email, form.senha)
    } catch (erro) {
      toast.error(erro.message)
    } finally {
      setCarregandoCadastro(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Painel lateral esquerdo */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-sidebar text-sidebar-foreground relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(circle at 20% 30%, oklch(0.78 0.11 75 / 0.5), transparent 50%), radial-gradient(circle at 80% 70%, oklch(0.42 0.09 160 / 0.5), transparent 50%)" }}
        />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Church className="h-5 w-5" />
          </div>
          <span className="font-display text-xl">Graça & Paz</span>
        </div>
        <div className="relative space-y-4">
          <h1 className="font-display text-5xl leading-tight">
            Cuidar do rebanho<br />começa com organização.
          </h1>
          <p className="text-sidebar-foreground/70 max-w-md">
            Acompanhe membros, eventos e ministérios em um só lugar — com a serenidade que sua missão merece.
          </p>
        </div>
        <div className="relative text-xs text-sidebar-foreground/50">
          © {new Date().getFullYear()} Igreja Graça & Paz
        </div>
      </div>

      {/* Formulários */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <h2 className="font-display text-3xl">Bem-vindo(a)</h2>
            <p className="text-sm text-muted-foreground">Entre ou crie sua conta para acessar o painel.</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="cadastrar">Cadastrar</TabsTrigger>
            </TabsList>

            {/* ─── Tab: Login ─── */}
            <TabsContent value="login" className="mt-6">
              <form onSubmit={onLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <Input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={carregandoLogin}>
                  {carregandoLogin ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            {/* ─── Tab: Cadastro ─── */}
            <TabsContent value="cadastrar" className="mt-6">
              <form onSubmit={onCadastrar} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="c-nome">Nome completo</Label>
                  <Input id="c-nome" required value={form.nome} onChange={(e) => set("nome", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-email">E-mail</Label>
                  <Input id="c-email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-senha">Senha</Label>
                  <Input id="c-senha" type="password" required minLength={5} value={form.senha} onChange={(e) => set("senha", e.target.value)} />
                </div>
                <div className="grid gap-3 grid-cols-2">
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
                    <Label htmlFor="c-nasc">Nascimento</Label>
                    <Input id="c-nasc" type="date" required value={form.data_nascimento} onChange={(e) => set("data_nascimento", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-tel">Telefone <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <Input
                    id="c-tel"
                    value={form.telefone}
                    onChange={(e) => set("telefone", e.target.value.replace(/\D/g, ""))}
                    maxLength={11}
                    placeholder="11987654321"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={carregandoCadastro}>
                  {carregandoCadastro ? "Criando conta..." : "Criar conta e entrar"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
