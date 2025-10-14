import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Onboarding from "./pages/Auth/Onboarding";
import Login from "./pages/Auth/Login";
import Cadastro from "./pages/Auth/Cadastro";
import OnboardingSetup from "./pages/Auth/OnboardingSetup";
import Home from "./pages/Home";
import Agenda from "./pages/Agenda";
import Clientes from "./pages/Clientes";
import Financas from "./pages/Financas";
import Perfil from "./pages/Perfil";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Admin/Dashboard";
import Profissionais from "./pages/Admin/Profissionais";
import Configuracoes from "./pages/Admin/Configuracoes";
import ProfissionalDashboard from "./pages/Profissional/Dashboard";
import ClienteHome from "./pages/Cliente/Home";
import MeusAgendamentos from "./pages/Cliente/MeusAgendamentos";
import Agendar from "./pages/Cliente/Agendar";
import SelecaoPerfil from "./pages/Auth/SelecaoPerfil";
import Relatorios from "./pages/Admin/Relatorios";
import Servicos from "./pages/Admin/Servicos";
import Avaliacoes from "./pages/Profissional/Avaliacoes";
import AvaliacoesAdmin from "./pages/Admin/AvaliacoesAdmin";
import VincularCliente from "./pages/Cliente/Vincular";

const queryClient = new QueryClient();

const App = () => {
  const onboardingVisto = localStorage.getItem('gestao_total_onboarding_visto') === 'true';
  
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes onboardingVisto={onboardingVisto} />
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

const AppRoutes = ({ onboardingVisto }: { onboardingVisto: boolean }) => {
  const { usuario } = useApp();

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/onboarding-setup" element={<OnboardingSetup />} />
      
      {usuario ? (
        <>
          {!usuario.setupCompleto ? (
            <Route path="*" element={<Navigate to="/onboarding-setup" replace />} />
          ) : (
            <>
              <Route path="/" element={<Navigate to={
                usuario.tipo === 'administrador' ? '/home' :
                usuario.tipo === 'profissional' ? '/agenda' :
                '/cliente/home'
              } replace />} />

              {/* Rotas Admin */}
              {usuario.tipo === 'administrador' && (
                <>
                  <Route path="/home" element={<Home />} />
                  <Route path="/agenda" element={<Agenda />} />
                  <Route path="/clientes" element={<Clientes />} />
                  <Route path="/financas" element={<Financas />} />
                  <Route path="/perfil" element={<Perfil />} />
                  <Route path="/selecao-perfil" element={<SelecaoPerfil />} />
                  <Route path="/profissionais" element={<Profissionais />} />
                  <Route path="/configuracoes" element={<Configuracoes />} />
                  <Route path="/relatorios" element={<Relatorios />} />
                  <Route path="/servicos" element={<Servicos />} />
                  <Route path="/avaliacoes-admin" element={<AvaliacoesAdmin />} />
                </>
              )}

              {/* Rotas Profissional */}
              {usuario.tipo === 'profissional' && (
                <>
                  <Route path="/agenda" element={<Agenda />} />
                  <Route path="/perfil" element={<Perfil />} />
                  <Route path="/avaliacoes" element={<Avaliacoes />} />
                </>
              )}

              {/* Rotas Cliente */}
              {usuario.tipo === 'cliente' && (
                <>
                  <Route path="/cliente/home" element={<ClienteHome />} />
                  <Route path="/agendar" element={<Agendar />} />
                  <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
                  <Route path="/cliente/vincular" element={<VincularCliente />} />
                </>
              )}
              <Route path="*" element={<NotFound />} />
            </>
          )}
        </>
      ) : (
        <>
          {!onboardingVisto ? (
            <>
              <Route path="/" element={<Navigate to="/onboarding" replace />} />
              <Route path="*" element={<Navigate to="/onboarding" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          )}
        </>
      )}
    </Routes>
  );
};

export default App;
