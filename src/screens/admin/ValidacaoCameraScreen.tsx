// src/screens/admin/ValidacaoCameraScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar,
  TouchableOpacity, Alert, Vibration,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useApp } from "../../context/AppContext";
import { theme } from "../../theme";

type ScanState = "idle" | "scanning" | "success" | "error";

export const ValidacaoCameraScreen: React.FC = () => {
  const { concluirAgendamentoPorQR, agendamentos, usuarios, servicos } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState]   = useState<ScanState>("idle");
  const [mensagem,  setMensagem]    = useState("");
  const [ativo,     setAtivo]       = useState(false);
  const cooldownRef = useRef(false);

  // Reativa scanner após 3s
  useEffect(() => {
    if (scanState === "success" || scanState === "error") {
      const t = setTimeout(() => {
        setScanState("scanning");
        cooldownRef.current = false;
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [scanState]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;

    // O QR Code deve conter apenas o ID do agendamento
    const agId = data.trim();
    const resultado = concluirAgendamentoPorQR(agId);

    if (resultado.sucesso) {
      const ag      = agendamentos.find((a) => a.id === agId);
      const cliente = usuarios.find((u) => u.id === ag?.clienteId)?.nome ?? "—";
      const servico = servicos.find((s) => s.id === ag?.servicoId)?.nome ?? "—";
      setScanState("success");
      setMensagem(`${servico} – ${cliente}\n${resultado.mensagem}`);
      Vibration.vibrate(200);
    } else {
      setScanState("error");
      setMensagem(resultado.mensagem);
      Vibration.vibrate([0, 100, 100, 100]);
    }
  };

  // ── Sem permissão ────────────────────────────
  if (!permission) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.centerText}>Verificando permissões...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.permIcon}>📷</Text>
          <Text style={styles.permTitle}>Câmera necessária</Text>
          <Text style={styles.permSub}>
            O acesso à câmera é necessário para validar atendimentos via QR Code.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Conceder permissão</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.card} />

      <View style={styles.header}>
        <View style={styles.logo}><Text style={styles.logoText}>B</Text></View>
        <View>
          <Text style={styles.headerTitle}>Validar QR Code</Text>
          <Text style={styles.headerSub}>Aponte para o código do cliente</Text>
        </View>
      </View>

      <View style={styles.cameraContainer}>
        {ativo ? (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={
              scanState === "scanning" ? handleBarCodeScanned : undefined
            }
          />
        ) : (
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.camIcon}>📷</Text>
            <Text style={styles.camPlaceholderText}>Câmera desativada</Text>
          </View>
        )}

        {/* Overlay de mira */}
        {ativo && (
          <View style={styles.overlay}>
            <View style={[
              styles.frame,
              scanState === "success" && styles.frameSuccess,
              scanState === "error"   && styles.frameError,
            ]}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <Text style={styles.scanHint}>
              {scanState === "scanning" ? "Posicione o QR Code dentro da área" : ""}
            </Text>
          </View>
        )}
      </View>

      {/* Feedback */}
      {(scanState === "success" || scanState === "error") && (
        <View style={[
          styles.feedback,
          scanState === "success" ? styles.feedbackSuccess : styles.feedbackError,
        ]}>
          <Text style={styles.feedbackIcon}>
            {scanState === "success" ? "✅" : "❌"}
          </Text>
          <Text style={styles.feedbackText}>{mensagem}</Text>
          <Text style={styles.feedbackSub}>Reiniciando em 3 segundos...</Text>
        </View>
      )}

      {/* Controles */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.btnCamera, ativo && styles.btnCameraAtivo]}
          onPress={() => {
            setAtivo((v) => !v);
            setScanState(ativo ? "idle" : "scanning");
            setMensagem("");
            cooldownRef.current = false;
          }}
          activeOpacity={0.85}
        >
          <Text style={[styles.btnCameraText, ativo && { color: "#000" }]}>
            {ativo ? "⏹  Desativar câmera" : "▶  Ativar câmera"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.dica}>
          O QR Code deve conter o ID do agendamento.{"\n"}
          Para testes, use um dos IDs: a1, a2, a3, a4
        </Text>
      </View>
    </SafeAreaView>
  );
};

const CORNER_SIZE = 22;
const CORNER_BORDER = 3;

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  centerText: { color: theme.colors.textMuted, fontSize: 14 },

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

  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
    position: "relative",
    overflow: "hidden",
  },
  cameraPlaceholder: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 12,
  },
  camIcon: { fontSize: 48 },
  camPlaceholderText: { color: theme.colors.textMuted, fontSize: 14 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center", justifyContent: "center",
  },
  frame: {
    width: 220, height: 220,
    borderColor: "transparent",
    position: "relative",
  },
  frameSuccess: {},
  frameError:   {},
  corner: {
    position: "absolute",
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderColor: theme.colors.gold, borderWidth: CORNER_BORDER,
  },
  cornerTL: { top: 0,  left: 0,  borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0,  right: 0, borderLeftWidth:  0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0,  borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth:  0, borderTopWidth: 0 },
  scanHint: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 16, textAlign: "center" },

  feedback: {
    margin: 16, borderRadius: 12, padding: 16,
    borderWidth: 1, alignItems: "center", gap: 6,
  },
  feedbackSuccess: { backgroundColor: theme.colors.successBg, borderColor: theme.colors.success },
  feedbackError:   { backgroundColor: theme.colors.dangerBg,  borderColor: theme.colors.danger  },
  feedbackIcon:    { fontSize: 28 },
  feedbackText:    { fontSize: 13, fontWeight: "500", color: theme.colors.text, textAlign: "center" },
  feedbackSub:     { fontSize: 11, color: theme.colors.textMuted },

  controls: { padding: 16, paddingBottom: 8 },
  btnCamera: {
    backgroundColor: "transparent",
    borderWidth: 1, borderColor: theme.colors.gold,
    borderRadius: 12, paddingVertical: 14, alignItems: "center", marginBottom: 14,
  },
  btnCameraAtivo:  { backgroundColor: theme.colors.gold },
  btnCameraText:   { fontSize: 15, color: theme.colors.gold, fontWeight: "500" },
  dica: { fontSize: 12, color: theme.colors.textMuted, textAlign: "center", lineHeight: 18 },

  permIcon:    { fontSize: 48, marginBottom: 16 },
  permTitle:   { fontSize: 18, fontWeight: "500", color: theme.colors.text, marginBottom: 8 },
  permSub:     { fontSize: 13, color: theme.colors.textMuted, textAlign: "center", marginBottom: 24, lineHeight: 20 },
  permBtn:     { backgroundColor: theme.colors.gold, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 },
  permBtnText: { fontSize: 15, fontWeight: "500", color: "#000" },
});
