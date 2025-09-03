import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { PeripheralServices } from "@/types/bluetooth";
import { Ionicons } from "@expo/vector-icons";

interface ConnectedStateProps {
  bleService: PeripheralServices;
  onWrite: () => void;
  onDisconnect: (id: string) => void;
}

const ConnectedState: React.FunctionComponent<ConnectedStateProps> = ({
  bleService,
  onDisconnect,
  onWrite,
}) => {
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Ionicons name="bluetooth" size={22} color="#000" />
        <Text style={styles.header}>Connected Device</Text>
      </View>

      {/* Device Info */}
      <View style={styles.infoBlock}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{bleService.name || "Unknown"}</Text>
      </View>
      <View style={styles.infoBlock}>
        <Text style={styles.label}>Peripheral ID</Text>
        <Text style={styles.value}>{bleService.peripheralId}</Text>
      </View>
      <View style={styles.infoBlock}>
        <Text style={styles.label}>Service ID</Text>
        <Text style={styles.value}>{bleService.serviceId}</Text>
      </View>

      {/* Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          onPress={() => onWrite()}
          style={[styles.button, styles.primary]}
        >
          <Ionicons name="create-outline" size={18} color="#000" />
          <Text style={styles.buttonText}>TEST</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onDisconnect(bleService.peripheralId)}
          style={[styles.button, styles.danger]}
        >
          <Ionicons name="power-outline" size={18} color="#fff" />
          <Text style={[styles.buttonText, { color: "#fff" }]}>DISCONNECT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConnectedState;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 18,
    marginVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  header: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginLeft: 8,
  },
  infoBlock: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 18,
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  primary: {
    backgroundColor: "#ffcd01", // Yellow
  },
  danger: {
    backgroundColor: "#e53935", // Red for disconnect
  },
  buttonText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: "700",
    color: "#000",
  },
});
