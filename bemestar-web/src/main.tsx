import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/700.css";
// PWA: guarda o evento de instalação o quanto antes e registra o service worker (só em produção)
import "./pwa/instalacao";
import { registrarServiceWorker } from "./pwa/registrarSW";
import { TransicaoProvider } from "./contexts/TransicaoProvider";
import AvisoAtualizacao from "./components/AvisoAtualizacao";

import App from "./App";
import { AuthProvider } from "./contexts/AuthProvider";

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
            <TransicaoProvider>
              <App />
              <AvisoAtualizacao />
            </TransicaoProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
