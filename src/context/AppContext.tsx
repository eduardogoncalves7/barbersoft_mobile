// src/context/AppContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  Usuario,
  Servico,
  Agendamento,
  TransacaoFinanceira,
  StatusAgendamento,
} from "../types";

// ─────────────────────────────────────────────
// DADOS SEED
// ─────────────────────────────────────────────
const SERVICOS_INICIAIS: Servico[] = [
  { id: "s1", nome: "Corte Clássico",  descricao: "Corte tradicional na tesoura",  preco: 45, duracaoMin: 30 },
  { id: "s2", nome: "Corte + Barba",   descricao: "Combo completo com navalha",    preco: 75, duracaoMin: 60 },
  { id: "s3", nome: "Barba Modelada",  descricao: "Alinhamento e hidratação",      preco: 35, duracaoMin: 30 },
  { id: "s4", nome: "Sobrancelha",     descricao: "Design e alinhamento",          preco: 20, duracaoMin: 15 },
  { id: "s5", nome: "Corte Degradê",   descricao: "Fade americano ou skin fade",   preco: 55, duracaoMin: 45 },
];

const USUARIOS_INICIAIS: Usuario[] = [
  { id: "u0", nome: "Administrador", email: "admin@barber.com",  role: "admin"     },
  { id: "u1", nome: "Carlos Silva",  email: "carlos@email.com",  role: "barbeiro"  },
  { id: "u2", nome: "João Mendes",   email: "joao@email.com",    role: "barbeiro"  },
  { id: "u3", nome: "Ana Costa",     email: "ana@email.com",     role: "cliente"   },
  { id: "u4", nome: "Pedro Alves",   email: "pedro@email.com",   role: "cliente"   },
  { id: "u5", nome: "Mariana Lima",  email: "mariana@email.com", role: "cliente"   },
];

const hoje = new Date().toISOString().split("T")[0];

const AGENDAMENTOS_INICIAIS: Agendamento[] = [
  { id: "a1", clienteId: "u3", barbeiroId: "u1", servicoId: "s2", data: hoje, hora: "09:00", status: "Concluído",  criadoEm: new Date().toISOString() },
  { id: "a2", clienteId: "u4", barbeiroId: "u1", servicoId: "s1", data: hoje, hora: "10:00", status: "Confirmado", criadoEm: new Date().toISOString() },
  { id: "a3", clienteId: "u5", barbeiroId: "u2", servicoId: "s5", data: hoje, hora: "11:00", status: "Pendente",   criadoEm: new Date().toISOString() },
  { id: "a4", clienteId: "u3", barbeiroId: "u2", servicoId: "s3", data: hoje, hora: "14:00", status: "Concluído",  criadoEm: new Date().toISOString() },
];

const TRANSACOES_INICIAIS: TransacaoFinanceira[] = [
  { id: "t1", agendamentoId: "a1", valor: 75, data: hoje, descricao: "Corte + Barba – Ana Costa"      },
  { id: "t2", agendamentoId: "a4", valor: 35, data: hoje, descricao: "Barba Modelada – Mariana Lima"  },
];

// ─────────────────────────────────────────────
// INTERFACE DO CONTEXT
// ─────────────────────────────────────────────
interface AppContextData {
  usuarioLogado: Usuario | null;
  usuarios: Usuario[];
  servicos: Servico[];
  agendamentos: Agendamento[];
  transacoes: TransacaoFinanceira[];

  login: (email: string) => { sucesso: boolean; mensagem?: string };
  logout: () => void;

  adicionarAgendamento: (
    dados: Omit<Agendamento, "id" | "status" | "criadoEm">
  ) => { sucesso: boolean; mensagem: string };

  concluirAgendamentoPorQR: (
    agendamentoId: string
  ) => { sucesso: boolean; mensagem: string };

  cancelarAgendamento: (agendamentoId: string) => void;
  atualizarStatusAgendamento: (id: string, status: StatusAgendamento) => void;

  faturamentoTotal: number;
  faturamentoPorDia: Record<string, number>;

  getBarbeiros: () => Usuario[];
  getAgendamentosHoje: () => Agendamento[];
  getAgendamentosCliente: (clienteId: string) => Agendamento[];
  getClientesUnicos: () => number;
}

const AppContext = createContext<AppContextData>({} as AppContextData);

// ─────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [usuarios]  = useState<Usuario[]>(USUARIOS_INICIAIS);
  const [servicos]  = useState<Servico[]>(SERVICOS_INICIAIS);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(AGENDAMENTOS_INICIAIS);
  const [transacoes,   setTransacoes]   = useState<TransacaoFinanceira[]>(TRANSACOES_INICIAIS);

  // ── AUTH ─────────────────────────────────────
  const login = useCallback(
    (email: string): { sucesso: boolean; mensagem?: string } => {
      const target = email.toLowerCase().trim();
      const usuario = usuarios.find((u) => u.email.toLowerCase() === target);

      if (!usuario) {
        // Cria cliente dinamicamente para protótipo
        const novo: Usuario = {
          id:    `u_${Date.now()}`,
          nome:  target.split("@")[0],
          email: target,
          role:  "cliente",
        };
        setUsuarioLogado(novo);
        return { sucesso: true };
      }

      setUsuarioLogado(usuario);
      return { sucesso: true };
    },
    [usuarios]
  );

  const logout = useCallback(() => setUsuarioLogado(null), []);

  // ── AGENDAMENTO ───────────────────────────────
  const adicionarAgendamento = useCallback(
    (dados: Omit<Agendamento, "id" | "status" | "criadoEm">): { sucesso: boolean; mensagem: string } => {

      // Validação 1: faixa de horário (08:00–19:00)
      const [hh, mm] = dados.hora.split(":").map(Number);
      const totalMin = hh * 60 + mm;
      if (totalMin < 480 || totalMin >= 1140) {
        return {
          sucesso: false,
          mensagem: "Horário fora do expediente. Atendemos das 08:00 às 19:00.",
        };
      }

      // Validação 2: conflito de agenda
      const conflito = agendamentos.find(
        (a) =>
          a.barbeiroId === dados.barbeiroId &&
          a.data       === dados.data       &&
          a.hora       === dados.hora       &&
          a.status     !== "Cancelado"
      );
      if (conflito) {
        return {
          sucesso: false,
          mensagem: `Barbeiro indisponível em ${dados.data} às ${dados.hora}. Escolha outro horário.`,
        };
      }

      const novo: Agendamento = {
        ...dados,
        id:       `a_${Date.now()}`,
        status:   "Pendente",
        criadoEm: new Date().toISOString(),
      };
      setAgendamentos((prev) => [...prev, novo]);
      return { sucesso: true, mensagem: "Agendamento criado com sucesso!" };
    },
    [agendamentos]
  );

  // ── CONCLUIR VIA QR ───────────────────────────
  const concluirAgendamentoPorQR = useCallback(
    (agendamentoId: string): { sucesso: boolean; mensagem: string } => {
      const ag = agendamentos.find((a) => a.id === agendamentoId);
      if (!ag)                         return { sucesso: false, mensagem: "Agendamento não encontrado." };
      if (ag.status === "Concluído")   return { sucesso: false, mensagem: "Atendimento já concluído." };
      if (ag.status === "Cancelado")   return { sucesso: false, mensagem: "Agendamento cancelado." };

      const servico = servicos.find((s) => s.id === ag.servicoId);
      const cliente = usuarios.find((u) => u.id === ag.clienteId);
      const valor   = servico?.preco ?? 0;

      setAgendamentos((prev) =>
        prev.map((a) => (a.id === agendamentoId ? { ...a, status: "Concluído" } : a))
      );

      const nova: TransacaoFinanceira = {
        id:             `t_${Date.now()}`,
        agendamentoId,
        valor,
        data:           new Date().toISOString().split("T")[0],
        descricao:      `${servico?.nome ?? "Serviço"} – ${cliente?.nome ?? "Cliente"}`,
      };
      setTransacoes((prev) => [...prev, nova]);

      return {
        sucesso: true,
        mensagem: `Atendimento concluído! R$ ${valor.toFixed(2)} adicionado ao financeiro.`,
      };
    },
    [agendamentos, servicos, usuarios]
  );

  const cancelarAgendamento = useCallback((id: string) => {
    setAgendamentos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Cancelado" } : a))
    );
  }, []);

  const atualizarStatusAgendamento = useCallback(
    (id: string, status: StatusAgendamento) => {
      setAgendamentos((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    },
    []
  );

  // ── DERIVADOS ─────────────────────────────────
  const faturamentoTotal = transacoes.reduce((acc, t) => acc + t.valor, 0);

  const faturamentoPorDia: Record<string, number> = transacoes.reduce(
    (acc, t) => ({ ...acc, [t.data]: (acc[t.data] ?? 0) + t.valor }),
    {} as Record<string, number>
  );

  const getBarbeiros = useCallback(
    () => usuarios.filter((u) => u.role === "barbeiro"),
    [usuarios]
  );

  const getAgendamentosHoje = useCallback(() => {
    const dataHoje = new Date().toISOString().split("T")[0];
    return agendamentos.filter(
      (a) => a.data === dataHoje && a.status !== "Cancelado"
    );
  }, [agendamentos]);

  const getAgendamentosCliente = useCallback(
    (clienteId: string) =>
      agendamentos
        .filter((a) => a.clienteId === clienteId)
        .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)),
    [agendamentos]
  );

  const getClientesUnicos = useCallback(() => {
    const ids = new Set(agendamentos.map((a) => a.clienteId));
    return ids.size;
  }, [agendamentos]);

  return (
    <AppContext.Provider
      value={{
        usuarioLogado,
        usuarios,
        servicos,
        agendamentos,
        transacoes,
        login,
        logout,
        adicionarAgendamento,
        concluirAgendamentoPorQR,
        cancelarAgendamento,
        atualizarStatusAgendamento,
        faturamentoTotal,
        faturamentoPorDia,
        getBarbeiros,
        getAgendamentosHoje,
        getAgendamentosCliente,
        getClientesUnicos,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextData => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp deve ser usado dentro de <AppProvider>");
  return ctx;
};
