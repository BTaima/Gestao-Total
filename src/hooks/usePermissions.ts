import { useApp } from '@/context/AppContext';
import { TipoUsuario } from '@/types';

export const usePermissions = () => {
  const { usuario } = useApp();
  
  const isAdmin = usuario?.tipo === TipoUsuario.ADMINISTRADOR;
  const isProfissional = usuario?.tipo === TipoUsuario.PROFISSIONAL;
  const isCliente = usuario?.tipo === TipoUsuario.CLIENTE;
  
  const canAccessProfissionais = isAdmin;
  const canAccessTodosClientes = isAdmin;
  const canAccessFinanceiroGeral = isAdmin;
  const canEditServicos = isAdmin;
  const canConfigureApp = isAdmin;
  
  const canAccessPropriaAgenda = isAdmin || isProfissional;
  const canAccessPropiosClientes = isAdmin || isProfissional;
  const canAccessProprioFinanceiro = isAdmin || isProfissional;
  
  const canMakeAgendamento = true; // todos podem
  const canViewServicos = true; // todos podem
  
  return {
    isAdmin,
    isProfissional,
    isCliente,
    canAccessProfissionais,
    canAccessTodosClientes,
    canAccessFinanceiroGeral,
    canEditServicos,
    canConfigureApp,
    canAccessPropriaAgenda,
    canAccessPropiosClientes,
    canAccessProprioFinanceiro,
    canMakeAgendamento,
    canViewServicos
  };
};
