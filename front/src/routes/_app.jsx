import { createFileRoute, Outlet, Link, useRouter, useRouterState, redirect } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { CARGOS_PRIVILEGIADOS, buscarStatusContribuicao } from "@/lib/api"

// beforeLoad roda antes de renderizar qualquer página filha desta rota
// Se não houver token, redireciona para o login antes de mostrar qualquer coisa
export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    const token = localStorage.getItem("token")
    if (!token) {
      throw redirect({ to: "/" })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  const router = useRouter()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const [bloqueado, setBloqueado] = useState(false)

  const cargo = localStorage.getItem("cargo")
  const ehPrivilegiado = CARGOS_PRIVILEGIADOS.includes(cargo)

  // Verifica se o sistema está bloqueado — apenas para usuários não-privilegiados
  useEffect(() => {
    if (ehPrivilegiado) return
    buscarStatusContribuicao()
      .then((dados) => setBloqueado(dados.bloqueado))
      .catch(() => {}) // falha silenciosa — não bloqueia por erro de rede
  }, [])

  const canGoBack = pathname !== "/dashboard"
  // Não exibe o overlay na própria página de manutenção (senão o usuário não consegue contribuir)
  const mostrarOverlay = bloqueado && !ehPrivilegiado && pathname !== "/manutencao"

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          {/* Cabeçalho fixo no topo */}
          <header className="flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur sticky top-0 z-10">
            <SidebarTrigger />
            {canGoBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.history.back()}
                className="gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            )}
            <div className="ml-auto text-sm text-muted-foreground">AD Fogo Para As Nações</div>
          </header>

          {/* Conteúdo da página atual — Outlet renderiza a rota filha */}
          <main className="flex-1 p-6 md:p-8 relative">
            <Outlet />

            {/* Overlay de bloqueio — cobre o conteúdo mas deixa a sidebar acessível */}
            {mostrarOverlay && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-6 max-w-md text-center px-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Sistema temporariamente bloqueado</h2>
                    <p className="text-muted-foreground text-sm">
                      A meta de manutenção mensal não foi atingida por 3 meses consecutivos.
                      Contribua para reativar o acesso ao sistema.
                    </p>
                  </div>
                  <Link to="/manutencao">
                    <Button>Ir para Manutenção</Button>
                  </Link>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
