import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

interface Peripheral {
  name?: string;
  localName?: string;
  rssi: number;
  id: string;
  advertising?: {
    isConnectable?: boolean;
  };
}

interface PeripheralListProps {
  peripherals: Peripheral[];
  onConnect: (peripheral: Peripheral) => Promise<void>;
}

const PeripheralList: React.FC<PeripheralListProps> = ({
  peripherals,
  onConnect,
}) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={peripherals.filter(
          (p) => p?.advertising?.isConnectable !== false
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onConnect(item)} style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{item.name || "Unknown Device"}</Text>
              <Text style={styles.rssi}>{item.rssi} dBm</Text>
            </View>
            <Text style={styles.subtitle}>
              ID: <Text style={styles.value}>{item.id}</Text>
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 12 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
  },
  card: {
    backgroundColor: "#f6f6f6",
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f6f6f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000", // black title
  },
  rssi: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffcd01", // yellow highlight
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  value: {
    color: "#000",
    fontWeight: "600",
  },
});

export default PeripheralList;
