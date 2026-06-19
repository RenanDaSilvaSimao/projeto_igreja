import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Calendar, MapPin, Users as UsersIcon, Plus, Trash2, CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { listarEventos, cadastrarEvento, deletarEvento, confirmarPresenca, cancelarPresenca } from "@/lib/api"

export const Route = createFileRoute("/_app/eventos")({
  component: EventosPage,
})

function EventosPage() {
  const [eventos, setEventos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)

  // Lê o cargo salvo no login — Líder cria/remove; demais apenas confirmam presença
  const cargo = localStorage.getItem("cargo")

  // Estado do formulário de novo evento
  const [form, setForm] = useState({
    nome_evento: "",
    data_evento: "",
    local_evento: "",
    limite_membros: "",
  })
  const [salvando, setSalvando] = useState(false)

  // Busca os eventos do back-end quando a página carrega
  useEffect(() => {
    listarEventos()
      .then(setEventos)
      .catch((e) => toast.error(e.message))
      .finally(() => setCarregando(false))
  }, [])

  const set = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }))

  // Datetime mínimo para o input — agora, convertido para o fuso local do browser
  // toISOString() usa UTC; subtraímos o offset para obter a hora local
  const agora = new Date()
  const minDatetime = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)

  const onRemoverEvento = async (id) => {
    if (!window.confirm("Remover este evento?")) return
    try {
      await deletarEvento(id)
      setEventos((prev) => prev.filter((e) => e.id !== id))
      toast.success("Evento removido.")
    } catch (erro) {
      toast.error(erro.message)
    }
  }

  const onCriarEvento = async (e) => {
    e.preventDefault()
    setSalvando(true)
    try {
      const dados = {
        nome_evento: form.nome_evento,
        data_evento: form.data_evento.replace("T", " "),
        local_evento: form.local_evento,
      }
      if (form.limite_membros) dados.limite_membros = Number(form.limite_membros)

      const novoEvento = await cadastrarEvento(dados)
      // Novo evento começa sem presenças e o Líder ainda não confirmou
      setEventos((prev) => [{ ...novoEvento, total_presencas: 0, eu_confirmei: false }, ...prev])
      toast.success("Evento criado!")
      setModalAberto(false)
      setForm({ nome_evento: "", data_evento: "", local_evento: "", limite_membros: "" })
    } catch (erro) {
      toast.error(erro.message)
    } finally {
      setSalvando(false)
    }
  }

  const onConfirmarPresenca = async (eventoId) => {
    try {
      await confirmarPresenca(eventoId)
      setEventos((prev) =>
        prev.map((e) =>
          e.id === eventoId
            ? { ...e, eu_confirmei: true, total_presencas: (e.total_presencas || 0) + 1 }
            : e
        )
      )
      toast.success("Presença confirmada!")
    } catch (erro) {
      toast.error(erro.message)
    }
  }

  const onCancelarPresenca = async (eventoId) => {
    try {
      await cancelarPresenca(eventoId)
      setEventos((prev) =>
        prev.map((e) =>
          e.id === eventoId
            ? { ...e, eu_confirmei: false, total_presencas: Math.max(0, (e.total_presencas || 1) - 1) }
            : e
        )
      )
      toast.success("Presença cancelada.")
    } catch (erro) {
      toast.error(erro.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Eventos</h1>
          <p className="text-muted-foreground">Encontros, cultos e atividades.</p>
        </div>

        {/* Botão de criar evento — apenas Líderes veem */}
        {cargo === "Líder" && (
          <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Novo evento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar evento</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCriarEvento} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Nome do evento</Label>
                  <Input required value={form.nome_evento} onChange={(e) => set("nome_evento", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Data e hora</Label>
                  {/* min impede selecionar data/hora passada diretamente no browser */}
                  <Input
                    type="datetime-local"
                    required
                    min={minDatetime}
                    value={form.data_evento}
                    onChange={(e) => set("data_evento", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Local</Label>
                  <Input required value={form.local_evento} onChange={(e) => set("local_evento", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Limite de membros <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <Input type="number" min="1" value={form.limite_membros} onChange={(e) => set("limite_membros", e.target.value)} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setModalAberto(false)}>Cancelar</Button>
                  <Button type="submit" disabled={salvando}>{salvando ? "Criando..." : "Criar evento"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {carregando ? (
        <p className="text-muted-foreground">Carregando eventos...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {eventos.map((e) => {
            const data = new Date(e.data_evento)
            const dataValida = !isNaN(data)
            const jaPassou = dataValida && data < new Date()
            const limiteAtingido = e.limite_membros && e.total_presencas >= e.limite_membros

            return (
              <Card key={e.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Coluna da data */}
                    <div className="flex flex-col items-center justify-center bg-sidebar text-sidebar-foreground p-5 min-w-[88px]">
                      {dataValida ? (
                        <>
                          <span className="text-xs uppercase tracking-wider text-sidebar-foreground/60">
                            {data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                          </span>
                          <span className="font-bold text-3xl leading-none mt-1">{data.getDate()}</span>
                          <span className="text-xs text-sidebar-foreground/60 mt-1">{data.getFullYear()}</span>
                        </>
                      ) : (
                        <span className="text-xs text-sidebar-foreground/60">{e.data_evento}</span>
                      )}
                    </div>

                    {/* Detalhes do evento */}
                    <div className="flex-1 p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-xl leading-tight">{e.nome_evento}</h3>
                        {cargo === "Líder" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive shrink-0"
                            onClick={() => onRemoverEvento(e.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        {dataValida && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {data.toLocaleDateString("pt-BR", { weekday: "long" })} ·{" "}
                              {data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{e.local_evento}</span>
                        </div>
                        {/* Contagem de presenças confirmadas */}
                        <div className="flex items-center gap-2">
                          <UsersIcon className="h-3.5 w-3.5" />
                          <span>
                            {e.total_presencas || 0} confirmado{e.total_presencas !== 1 ? "s" : ""}
                            {e.limite_membros ? ` / ${e.limite_membros}` : ""}
                          </span>
                        </div>
                      </div>

                      {/* Status / botão de presença */}
                      {jaPassou ? (
                        <p className="text-xs text-muted-foreground italic pt-1">Tempo esgotado</p>
                      ) : e.eu_confirmei ? (
                        <div className="pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() => onCancelarPresenca(e.id)}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1.5" />
                            Cancelar presença
                          </Button>
                        </div>
                      ) : limiteAtingido ? (
                        <p className="text-xs text-muted-foreground italic pt-1">Limite atingido</p>
                      ) : (
                        <div className="pt-1">
                          <Button size="sm" onClick={() => onConfirmarPresenca(e.id)}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            Confirmar presença
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {eventos.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-12">
              Nenhum evento cadastrado ainda.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
