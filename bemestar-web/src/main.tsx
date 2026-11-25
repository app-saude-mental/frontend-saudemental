import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// Tipografia: Inter (texto) e Cormorant Garamond (títulos). Só os pesos usados.
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/500-italic.css";
// PWA: guarda o evento de instalação o quanto antes e registra o service worker (só em produção)
import "./pwa/instalacao";
import { registrarServiceWorker } from "./pwa/registrarSW";
import { TransicaoProvider } from "./contexts/TransicaoProvider";
import AvisoAtualizacao from "./components/AvisoAtualizacao";

import App from "./App";
// refino visual: por último, para valer sobre o CSS de cada tela
import "./styles/refino.css";
import { AuthProvider } from "./contexts/AuthProvider";
import { SomProvider } from "./contexts/SomProvider";

registrarServiceWorker();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            {/* som do Momento de paz: acima das rotas, continua tocando ao navegar */}
            <SomProvider>
              <TransicaoProvider>
                <App />
                <AvisoAtualizacao />
              </TransicaoProvider>
            </SomProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
