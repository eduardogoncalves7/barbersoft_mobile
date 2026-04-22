// src/types/index.ts

export type StatusAgendamento =
  | "Pendente"
  | "Confirmado"
  | "Concluído"
  | "Cancelado";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: "admin" | "cliente" | "barbeiro";
  avatarUrl?: string;
}

export interface Servico {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  duracaoMin: number;
}

export interface Agendamento {
  id: string;
  clienteId: string;
  barbeiroId: string;
  servicoId: string;
  data: string;   // "YYYY-MM-DD"
  hora: string;   // "HH:MM"
  status: StatusAgendamento;
  criadoEm: string;
}

export interface TransacaoFinanceira {
  id: string;
  agendamentoId: string;
  valor: number;
  data: string;
  descricao: string;
}

// ─── Tipos de navegação ───────────────────────────
export type RootStackParamList = {
  Login: undefined;
  AdminTabs: undefined;
  ClientTabs: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Agendamentos: undefined;
  ValidacaoCamera: undefined;
};

export type ClientTabParamList = {
  Home: undefined;
  Agendar: undefined;
  MeusAgendamentos: undefined;
};
