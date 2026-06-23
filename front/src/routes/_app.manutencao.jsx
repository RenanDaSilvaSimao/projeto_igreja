import { createFileRoute } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  CARGOS_PRIVILEGIADOS,
  buscarStatusContribuicao,
  registrarContribuicao,
  listarContribuicoes,
} from "@/lib/api"

export const Route = createFileRoute("/_app/manutencao")({
  component: PaginaManutencao,
})

const PIX_CHAVE = "14996640461"
const PIX_FORMATADA = "(14) 99664-0461"

function PaginaManutencao() {
  const [status, setStatus] = useState(null)
  const [contribuicoes, setContribuicoes] = useState([])
  const [valor, setValor] = useState("")
  const [carregando, setCarregando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const cargo = localStorage.getItem("cargo")
  const ehPrivilegiado = CARGOS_PRIVILEGIADOS.includes(cargo)

  const agora = new Date()
  const mesAtual = agora.getMonth() + 1
  const anoAtual = agora.getFullYear()
  const nomeMes = agora.toLocaleString("pt-BR", { month: "long", year: "numeric" })

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    setCarregando(true)
    try {
      const statusAtual = await buscarStatusContribuicao()
      setStatus(statusAtual)

      if (ehPrivilegiado) {
        const lista = await listarContribuicoes(mesAtual, anoAtual)
        setContribuicoes(lista)
      }
    } catch (erro) {
      toast.error(erro.message)
    } finally {
      setCarregando(false)
    }
  }

  async function handleRegistrar(e) {
    e.preventDefault()
    const valorNum = parseFloat(valor)
    if (!valorNum || valorNum < 1 || valorNum > 500) {
      toast.error("Valor deve ser entre R$1 e R$500")
      return
    }
    setEnviando(true)
    try {
      await registrarContribuicao(valorNum)
      toast.success("Contribuição registrada com sucesso!")
      setValor("")
      await carregarDados()
    } catch (erro) {
      toast.error(erro.message)
    } finally {
      setEnviando(false)
    }
  }

  async function handleCopiarPix() {
    await navigator.clipboard.writeText(PIX_CHAVE)
    setCopiado(true)
    toast.success("Chave PIX copiada!")
    setTimeout(() => setCopiado(false), 3000)
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        Carregando...
      </div>
    )
  }

  const porcentagem = status ? Math.min(100, (status.efetivo / status.meta) * 100) : 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manutenção do Sistema</h1>
        <p className="text-muted-foreground text-sm mt-1 capitalize">{nomeMes}</p>
      </div>

      {/* Progresso do mês */}
      {status && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meta mensal: R$ {status.meta.toFixed(2)}</CardTitle>
            <CardDescription>
              {status.atingida
                ? "Meta atingida! O sistema está ativo."
                : `Faltam R$ ${status.faltam.toFixed(2)} para atingir a meta.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={porcentagem} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Arrecadado: R$ {status.totalMes.toFixed(2)}</span>
              <span>{porcentagem.toFixed(0)}%</span>
            </div>
            {status.surplusAnterior > 0 && (
              <p className="text-sm text-green-600 dark:text-green-400">
                + R$ {status.surplusAnterior.toFixed(2)} de sobra do mês anterior
              </p>
            )}
            {status.bloqueado && (
              <p className="text-sm text-destructive font-medium">
                ⚠ Sistema bloqueado: meta não atingida por {status.mesesConsecutivosFalhos} mês(es) consecutivo(s).
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Chave PIX */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chave PIX</CardTitle>
          <CardDescription>
            Faça o PIX e depois registre o valor abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Celular</p>
              <p className="font-mono font-semibold tracking-wide">{PIX_FORMATADA}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto gap-2"
              onClick={handleCopiarPix}
            >
              {copiado ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copiado ? "Copiado!" : "Copiar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de contribuição */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registrar contribuição</CardTitle>
          <CardDescription>
            {status?.jaContribuiu
              ? `Você já contribuiu R$ ${status.minhaContribuicao?.toFixed(2)} este mês.`
              : "Após fazer o PIX, registre o valor aqui. Uma contribuição por membro por mês."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status?.jaContribuiu ? (
            <p className="text-sm text-muted-foreground">
              Sua contribuição deste mês já foi registrada. Obrigado!
            </p>
          ) : (
            <form onSubmit={handleRegistrar} className="flex gap-3 items-end">
              <div className="flex-1">
                <Label htmlFor="valor" className="mb-2 block">
                  Valor (R$)
                </Label>
                <Input
                  id="valor"
                  type="number"
                  min="1"
                  max="500"
                  step="0.01"
                  placeholder="Ex: 20.00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={enviando}>
                {enviando ? "Registrando..." : "Registrar"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Lista de contribuições — apenas cargos privilegiados */}
      {ehPrivilegiado && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contribuições do mês</CardTitle>
            <CardDescription>
              {contribuicoes.length} contribuição(ões) registrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contribuicoes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma contribuição registrada ainda este mês.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contribuicoes.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.nome}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {c.cargo}
                      </TableCell>
                      <TableCell className="text-right">
                        R$ {parseFloat(c.valor).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(c.criado_em).toLocaleDateString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
