import { createFileRoute, Outlet, useRouter, useRouterState, redirect } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"

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

  // Só mostra o botão "Voltar" quando não estiver na página principal
  const canGoBack = pathname !== "/dashboard"

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
            <div className="ml-auto text-sm text-muted-foreground">Igreja Graça & Paz</div>
          </header>

          {/* Conteúdo da página atual — Outlet renderiza a rota filha */}
          <main className="flex-1 p-6 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
