# BarberSoft 💈

Protótipo funcional de sistema de gestão para barbearias — desenvolvido como projeto acadêmico da disciplina de Engenharia de Software.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | React Native + Expo (Managed Workflow) |
| Linguagem | TypeScript |
| Navegação | React Navigation v6 (Stack + Bottom Tabs) |
| Estado | Context API + useState |
| Câmera/QR | expo-camera |

## Estrutura de pastas

```
BarberSoft/
├── App.tsx                          # Entry point
├── app.json                         # Config Expo
├── package.json
├── tsconfig.json
└── src/
    ├── context/
    │   └── AppContext.tsx            # Estado global + regras de negócio
    ├── navigation/
    │   ├── RootNavigator.tsx         # Roteador raiz (Login / Admin / Cliente)
    │   ├── AdminNavigator.tsx        # Tab Navigator do Admin
    │   └── ClientNavigator.tsx       # Tab Navigator do Cliente
    ├── screens/
    │   ├── auth/
    │   │   └── LoginScreen.tsx
    │   ├── admin/
    │   │   ├── DashboardScreen.tsx
    │   │   ├── AgendamentosAdminScreen.tsx
    │   │   └── ValidacaoCameraScreen.tsx
    │   └── client/
    │       ├── HomeClienteScreen.tsx
    │       ├── AgendarScreen.tsx
    │       └── MeusAgendamentosScreen.tsx
    ├── types/
    │   └── index.ts                  # Interfaces TypeScript globais
    └── theme/
        └── index.ts                  # Design tokens (cores, espaçamentos)
```

## Como rodar

### Pré-requisitos
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go no celular (iOS ou Android) **ou** emulador configurado

### Instalação

```bash
cd BarberSoft
npm install
npx expo start
```

Escaneie o QR Code com o app **Expo Go** ou pressione `a` (Android) / `i` (iOS) no terminal.

## Credenciais de acesso

| Perfil | E-mail |
|--------|--------|
| **Superadmin** | `admin@barber.com` |
| Barbeiro | `carlos@email.com` |
| Cliente | `ana@email.com` |

Qualquer outro e-mail cria um cliente dinamicamente.

## Funcionalidades

### Visão Admin
- **Dashboard** — cards de métricas (clientes, agendamentos do dia, faturamento total) + gráfico de barras semanal + lista de agendamentos do dia
- **Agendamentos** — listagem com filtro por status + gerenciamento (confirmar/cancelar) via Alert
- **Validação QR** — câmera para escanear QR Code; ao detectar o ID de um agendamento, muda status para "Concluído" e registra transação financeira

### Visão Cliente
- **Home** — banner de ação rápida, próximo agendamento, lista de serviços e equipe
- **Agendar** — seleção de serviço → barbeiro → data → horário (com bloqueio de slots ocupados em tempo real) → resumo → confirmação
- **Meus agendamentos** — histórico com opção de cancelamento

## Regras de negócio implementadas

1. **Faixa de horário**: agendamentos só são aceitos entre 08:00 e 19:00
2. **Anti-conflito**: impede dois agendamentos para o mesmo barbeiro na mesma data/hora (ignora cancelados)
3. **Cálculo financeiro**: faturamento é derivado das transações geradas ao concluir atendimentos via QR
4. **Roteamento por perfil**: o e-mail `admin@barber.com` acessa o painel admin; demais acessam a visão cliente

## Dados em memória (seed)

O app inicializa com 5 usuários, 5 serviços, 4 agendamentos e 2 transações pré-cadastrados para demonstração imediata. Todos os dados vivem no `AppContext` e são resetados ao reiniciar o app — comportamento esperado para o protótipo acadêmico.

## Gerar QR Codes para teste

Para testar a validação por câmera, gere QR Codes com os seguintes conteúdos (IDs dos agendamentos seed):

- `a2` → Agendamento Confirmado (Pedro Alves - Corte Clássico)
- `a3` → Agendamento Pendente (Mariana Lima - Corte Degradê)

Use qualquer gerador online de QR Code (ex: qr-code-generator.com) e aponte a câmera do app.

---

Projeto acadêmico — Engenharia de Software · 2025
