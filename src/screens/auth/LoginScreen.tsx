// src/screens/auth/LoginScreen.tsx
import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
  KeyboardAvoidingView, Platform, Animated,
  ScrollView,
} from "react-native";
import { useApp } from "../../context/AppContext";
import { theme } from "../../theme";

const QUICK_LOGINS = [
  { label: "Admin",    email: "admin@barber.com"  },
  { label: "Barbeiro", email: "carlos@email.com"  },
  { label: "Cliente",  email: "ana@email.com"     },
];

export const LoginScreen: React.FC = () => {
  const { login } = useApp();
  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async (overrideEmail?: string) => {
    const target = (overrideEmail ?? email).trim();

    if (!target || !target.includes("@")) {
      setError("Informe um e-mail válido.");
      shake();
      return;
    }

    setLoading(true);
    setError("");

    // Simula latência de rede
    await new Promise((r) => setTimeout(r, 500));

    const resultado = login(target);
    setLoading(false);

    if (!resultado.sucesso) {
      setError(resultado.mensagem ?? "Erro ao autenticar.");
      shake();
    }
    // Navegação é automática via RootNavigator (observa usuarioLogado)
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Brand ───────────────────────────── */}
          <View style={styles.brand}>
            <View style={styles.logoRing}>
              <Text style={styles.logoLetter}>B</Text>
            </View>
            <Text style={styles.brandName}>BARBERSOFT</Text>
            <Text style={styles.brandTag}>Sistema de Gestão</Text>
            <View style={styles.goldLine} />
          </View>

          {/* ── Formulário ──────────────────────── */}
          <Animated.View
            style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}
          >
            <Text style={styles.cardTitle}>Bem-vindo de volta</Text>
            <Text style={styles.cardSub}>Digite seu e-mail para continuar</Text>

            <Text style={styles.inputLabel}>E-MAIL</Text>
            <TextInput
              style={[styles.input, !!error && styles.inputError]}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(""); }}
              placeholder="seu@email.com"
              placeholderTextColor={theme.colors.textHint}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => handleLogin()}
            />

            <Text style={styles.hintLabel}>Acesso rápido:</Text>
            <View style={styles.chipsRow}>
              {QUICK_LOGINS.map((q) => (
                <TouchableOpacity
                  key={q.email}
                  style={styles.chip}
                  onPress={() => { setEmail(q.email); setError(""); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText}>{q.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={() => handleLogin()}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryText}>
                {loading ? "Entrando..." : "Entrar"}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.divLine} />
              <Text style={styles.divText}>ou</Text>
              <View style={styles.divLine} />
            </View>

            <TouchableOpacity
              style={styles.btnGhost}
              onPress={() => handleLogin(`visitante_${Date.now()}@barber.com`)}
              activeOpacity={0.7}
            >
              <Text style={styles.btnGhostText}>Continuar como visitante</Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.footer}>BarberSoft v1.0 · Projeto Acadêmico ESW</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  kav:  { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
    paddingVertical: theme.spacing.xxxl,
  },

  brand: { alignItems: "center", marginBottom: 36, width: "100%" },
  logoRing: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: theme.colors.gold,
    alignItems: "center", justifyContent: "center",
    marginBottom: 14,
  },
  logoLetter: { fontSize: 38, fontWeight: "500", color: "#000" },
  brandName:  { fontSize: 24, fontWeight: "500", letterSpacing: 3, color: theme.colors.text },
  brandTag:   { fontSize: 12, color: theme.colors.textMuted, marginTop: 4, letterSpacing: 1 },
  goldLine:   { width: 36, height: 2, backgroundColor: theme.colors.gold, borderRadius: 2, marginTop: 14 },

  card: {
    width: "100%",
    backgroundColor: theme.colors.card,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.lg, padding: 22,
  },
  cardTitle: { fontSize: 17, fontWeight: "500", color: theme.colors.text, marginBottom: 4 },
  cardSub:   { fontSize: 12, color: theme.colors.textMuted, marginBottom: 20 },

  inputLabel: {
    fontSize: 10, fontWeight: "500", letterSpacing: 1.5,
    color: theme.colors.textMuted, marginBottom: 6,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1, borderColor: "rgba(212,175,55,0.25)",
    borderRadius: theme.radius.sm,
    color: theme.colors.text, fontSize: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 14,
  },
  inputError: { borderColor: theme.colors.danger },

  hintLabel: { fontSize: 11, color: theme.colors.textMuted, marginBottom: 8 },
  chipsRow:  { flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: theme.radius.full,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  chipText: { fontSize: 12, color: theme.colors.textMuted },

  errorBox: {
    backgroundColor: theme.colors.dangerBg,
    borderWidth: 1, borderColor: "rgba(239,83,80,0.25)",
    borderRadius: theme.radius.sm, padding: 10, marginBottom: 14,
  },
  errorText: { fontSize: 13, color: theme.colors.danger, textAlign: "center" },

  btnPrimary: {
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radius.md, paddingVertical: 14,
    alignItems: "center",
  },
  btnDisabled:     { opacity: 0.6 },
  btnPrimaryText:  { fontSize: 15, fontWeight: "500", color: "#000", letterSpacing: 0.5 },

  divider: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.07)" },
  divText: { fontSize: 12, color: theme.colors.textHint },

  btnGhost: {
    borderWidth: 1, borderColor: "rgba(212,175,55,0.3)",
    borderRadius: theme.radius.md, paddingVertical: 13, alignItems: "center",
  },
  btnGhostText: { fontSize: 14, color: theme.colors.gold },

  footer: { marginTop: 24, fontSize: 11, color: "#444", textAlign: "center" },
});
