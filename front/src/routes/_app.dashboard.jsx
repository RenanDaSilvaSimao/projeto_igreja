import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Users, Calendar, TrendingUp, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listarMembros, listarEventos } from "@/lib/api"

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
})

function Dashboard() {
  // Estados para armazenar os dados vindos do back-end
  const [membros, setMembros] = useState([])
  const [eventos, setEventos] = useState([])
  const [carregando, setCarregando] = useState(true)

  // useEffect roda uma vez quando o componente é montado
  // Busca membros e eventos da API em paralelo com Promise.all
  useEffect(() => {
    Promise.all([listarMembros(), listarEventos()])
      .then(([dadosMembros, dadosEventos]) => {
        setMembros(dadosMembros)
        setEventos(dadosEventos)
      })
      .catch(console.error)
      .finally(() => setCarregando(false))
  }, [])

  // Calcula estatísticas a partir dos dados recebidos
  const ativos = membros.filter((m) => m.ativo).length

  const stats = [
    { label: "Membros ativos", value: ativos, icon: CheckCircle, hint: `${membros.length} no total` },
    { label: "Total de membros", value: membros.length, icon: Users, hint: "Cadastrados no sistema" },
    { label: "Eventos", value: eventos.length, icon: Calendar, hint: "Cadastrados no sistema" },
    { label: "Taxa de ativos", value: membros.length ? `${Math.round((ativos / membros.length) * 100)}%` : "—", icon: TrendingUp, hint: "Membros ativos" },
  ]

  if (carregando) {
    return <div className="text-muted-foreground">Carregando...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Painel</h1>
        <p className="text-muted-foreground">Visão geral da sua comunidade.</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{s.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Lista dos últimos eventos cadastrados */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos cadastrados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {eventos.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <div className="font-medium">{e.nome_evento}</div>
                  <div className="text-xs text-muted-foreground">{e.local_evento}</div>
                </div>
                <div className="text-sm text-muted-foreground">{e.data_evento}</div>
              </div>
            ))}
            {eventos.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum evento cadastrado.</p>
            )}
          </CardContent>
        </Card>

        {/* Lista dos últimos membros cadastrados */}
        <Card>
          <CardHeader>
            <CardTitle>Membros recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {membros.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <div className="font-medium">{m.nome}</div>
                  <div className="text-xs text-muted-foreground">{m.email}</div>
                </div>
                <span className="text-xs text-muted-foreground">{m.cargo}</span>
              </div>
            ))}
            {membros.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum membro cadastrado.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
