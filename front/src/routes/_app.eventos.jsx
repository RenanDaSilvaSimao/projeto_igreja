import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Calendar, MapPin, Users as UsersIcon, Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { listarEventos, cadastrarEvento } from "@/lib/api"

export const Route = createFileRoute("/_app/eventos")({
  component: EventosPage,
})

function EventosPage() {
  const [eventos, setEventos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)

  // Estado do formulário de novo evento
  const [form, setForm] = useState({
    nome_evento: "",
    data_evento: "", // input datetime-local retorna "YYYY-MM-DDTHH:mm" — convertemos antes de enviar
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

  const onCriarEvento = async (e) => {
    e.preventDefault()
    setSalvando(true)
    try {
      const dados = {
        nome_evento: form.nome_evento,
        // datetime-local retorna "YYYY-MM-DDTHH:mm" mas o back-end espera "YYYY-MM-DD HH:MM"
        // substituímos o "T" por espaço
        data_evento: form.data_evento.replace("T", " "),
        local_evento: form.local_evento,
      }
      // limite_membros é opcional — só inclui se preenchido
      if (form.limite_membros) dados.limite_membros = Number(form.limite_membros)

      const novoEvento = await cadastrarEvento(dados)
      setEventos((prev) => [novoEvento, ...prev]) // adiciona no topo da lista
      toast.success("Evento criado!")
      setModalAberto(false)
      setForm({ nome_evento: "", data_evento: "", local_evento: "", limite_membros: "" })
    } catch (erro) {
      toast.error(erro.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Eventos</h1>
          <p className="text-muted-foreground">Encontros, cultos e atividades.</p>
        </div>

        {/* Botão que abre o modal de criação */}
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
                {/* datetime-local é o input nativo do browser para data + hora juntos */}
                <Input type="datetime-local" required value={form.data_evento} onChange={(e) => set("data_evento", e.target.value)} />
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
      </div>

      {carregando ? (
        <p className="text-muted-foreground">Carregando eventos...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {eventos.map((e) => {
            // data_evento vem como string do banco — tentamos parsear para exibir formatado
            const data = new Date(e.data_evento)
            const dataValida = !isNaN(data)

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
                      <h3 className="font-bold text-xl leading-tight">{e.nome_evento}</h3>
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        {dataValida && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{data.toLocaleDateString("pt-BR", { weekday: "long" })} · {data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{e.local_evento}</span>
                        </div>
                        {e.limite_membros && (
                          <div className="flex items-center gap-2">
                            <UsersIcon className="h-3.5 w-3.5" />
                            <span>Limite: {e.limite_membros} participantes</span>
                          </div>
                        )}
                      </div>
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
