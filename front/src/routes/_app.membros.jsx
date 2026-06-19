import { createFileRoute, Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Search, UserPlus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { listarMembros, deletarMembro } from "@/lib/api"

export const Route = createFileRoute("/_app/membros")({
  component: MembrosPage,
})

function MembrosPage() {
  const [membros, setMembros] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [q, setQ] = useState("") // texto de busca

  // Lê o cargo salvo no login — só Líder vê o botão de remover
  const cargo = localStorage.getItem("cargo")

  // Busca os membros do back-end quando a página carrega
  useEffect(() => {
    listarMembros()
      .then(setMembros)
      .catch((e) => toast.error(e.message))
      .finally(() => setCarregando(false))
  }, [])

  // Filtra localmente pelo texto digitado
  const filtrados = membros.filter(
    (m) =>
      m.nome.toLowerCase().includes(q.toLowerCase()) ||
      m.email.toLowerCase().includes(q.toLowerCase()) ||
      m.cargo.toLowerCase().includes(q.toLowerCase()),
  )

  // Remove um membro e atualiza a lista sem recarregar a página
  const handleDeletar = async (id, nome) => {
    if (!confirm(`Remover ${nome}?`)) return
    try {
      await deletarMembro(id)
      setMembros((prev) => prev.filter((m) => m.id !== id)) // remove do estado local
      toast.success("Membro removido.")
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl">Membros</h1>
          <p className="text-muted-foreground">{membros.length} pessoas na sua comunidade.</p>
        </div>
        <Button asChild>
          <Link to="/membros/novo">
            <UserPlus className="h-4 w-4" /> Novo membro
          </Link>
        </Button>
      </div>

      <Card className="p-4">
        {/* Campo de busca */}
        <div className="relative max-w-sm mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, cargo, e-mail..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>

        {carregando ? (
          <p className="text-muted-foreground py-8 text-center">Carregando membros...</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Ingresso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {/* Avatar com as iniciais do nome */}
                        <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-secondary-foreground">
                          {m.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="font-medium">{m.nome}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{m.email}</div>
                      <div className="text-xs text-muted-foreground">{m.telefone || "—"}</div>
                    </TableCell>
                    <TableCell>{m.cargo}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {/* data_ingresso vem do PostgreSQL como string ISO — formatamos para pt-BR */}
                      {m.data_ingresso
                        ? new Date(m.data_ingresso).toLocaleDateString("pt-BR")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {/* ativo é boolean no banco — true = Ativo, false = Inativo */}
                      <Badge variant={m.ativo ? "default" : "secondary"}>
                        {m.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {cargo === "Líder" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletar(m.id, m.nome)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filtrados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Nenhum membro encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}
