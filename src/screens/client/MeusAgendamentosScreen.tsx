// src/screens/client/MeusAgendamentosScreen.tsx
import React, { useMemo } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, SafeAreaView, StatusBar, Alert,
} from "react-native";
import { useApp } from "../../context/AppContext";
import { theme } from "../../theme";

export const MeusAgendamentosScreen: React.FC = () => {
  const {
    usuarioLogado, getAgendamentosCliente,
    servicos, usuarios, cancelarAgendamento,
  } = useApp();

  const lista = useMemo(() => {
    if (!usuarioLogado) return [];
    return getAgendamentosCliente(usuarioLogado.id).map((ag) => ({
      ...ag,
      servicoNome:  servicos.find((s) => s.id === ag.servicoId)?.nome  ?? "—",
      barbeiroNome: usuarios.find((u) => u.id === ag.barbeiroId)?.nome ?? "—",
      preco:        servicos.find((s) => s.id === ag.servicoId)?.preco ?? 0,
    }));
  }, [usuarioLogado, getAgendamentosCliente, servicos, usuarios]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Concluído":  return { bg: theme.colors.successBg, text: theme.colors.success };
      case "Confirmado": return { bg: theme.colors.infoBg,    text: theme.colors.info    };
      case "Cancelado":  return { bg: theme.colors.dangerBg,  text: theme.colors.danger  };
      default:           return { bg: theme.colors.goldDim,   text: theme.colors.gold    };
    }
  };

  const handleCancelar = (id: string) => {
    Alert.alert(
      "Cancelar agendamento",
      "Tem certeza que deseja cancelar este agendamento?",
      [
        { text: "Sim, cancelar", style: "destructive", onPress: () => cancelarAgendamento(id) },
        { text: "Não", style: "cancel" },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.card} />

      <View style={styles.header}>
        <View style={styles.logo}><Text style={styles.logoText}>B</Text></View>
        <View>
          <Text style={styles.headerTitle}>Meus agendamentos</Text>
          <Text style={styles.headerSub}>{lista.length} no total</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {lista.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✂️</Text>
            <Text style={styles.emptyTitle}>Nenhum agendamento</Text>
            <Text style={styles.emptySub}>Você ainda não possui agendamentos. Que tal marcar um horário?</Text>
          </View>
        ) : (
          lista.map((ag) => {
            const ss = getStatusStyle(ag.status);
            const cancelavel = ag.status === "Pendente" || ag.status === "Confirmado";
            return (
              <View key={ag.id} style={styles.card}>
                <View style={[styles.cardAccent, { backgroundColor: ss.text }]} />
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardServico}>{ag.servicoNome}</Text>
                    <Text style={styles.cardBarbeiro}>✂️ {ag.barbeiroNome}</Text>
                  </View>
                  <View style={[styles.pill, { backgroundColor: ss.bg }]}>
                    <Text style={[styles.pillText, { color: ss.text }]}>{ag.status}</Text>
                  </View>
                </View>

                <View style={styles.cardMetas}>
                  <Text style={styles.cardMeta}>📅 {ag.data}</Text>
                  <Text style={styles.cardMeta}>🕐 {ag.hora}</Text>
                  <Text style={[styles.cardPreco, { color: ss.text }]}>R$ {ag.preco}</Text>
                </View>

                {cancelavel && (
                  <TouchableOpacity
                    style={styles.btnCancelar}
                    onPress={() => handleCancelar(ag.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.btnCancelarText}>Cancelar agendamento</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: 16, paddingBottom: 40 },

  header: {
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  logo:        { width: 34, height: 34, borderRadius: 8, backgroundColor: theme.colors.gold, alignItems: "center", justifyContent: "center" },
  logoText:    { fontSize: 18, fontWeight: "500", color: "#000" },
  headerTitle: { fontSize: 16, fontWeight: "500", color: theme.colors.text },
  headerSub:   { fontSize: 12, color: theme.colors.textMuted },

  emptyContainer: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyIcon:      { fontSize: 48 },
  emptyTitle:     { fontSize: 16, fontWeight: "500", color: theme.colors.text },
  emptySub:       { fontSize: 13, color: theme.colors.textMuted, textAlign: "center", maxWidth: 260 },

  card: {
    backgroundColor: theme.colors.card,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: 12, padding: 14, marginBottom: 10, overflow: "hidden",
  },
  cardAccent:  { position: "absolute", top: 0, left: 0, bottom: 0, width: 3 },
  cardTop:     { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  cardServico: { fontSize: 14, fontWeight: "500", color: theme.colors.text, marginBottom: 4 },
  cardBarbeiro:{ fontSize: 12, color: theme.colors.textMuted },
  cardMetas:   { flexDirection: "row", gap: 14, alignItems: "center" },
  cardMeta:    { fontSize: 12, color: theme.colors.textMuted },
  cardPreco:   { fontSize: 13, fontWeight: "500", marginLeft: "auto" },
  pill:        { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  pillText:    { fontSize: 11 },
  btnCancelar: {
    marginTop: 12, borderWidth: 1,
    borderColor: "rgba(239,83,80,0.3)",
    borderRadius: 8, paddingVertical: 8, alignItems: "center",
  },
  btnCancelarText: { fontSize: 13, color: theme.colors.danger },
});
