import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AccessControl from "@/components/AccessControl";

const AccountSettings = () => {
  const router = useRouter();
  return (
    <AccessControl required="accountSettings">
      <View style={styles.container}>
        <View style={styles.headerBox}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Account Settings</Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        <View style={styles.section}>
          <SettingOption
            icon="stats-chart-outline"
            label="Dashboard"
            onPress={() => router.push("/dashboard")}
          />
          <SettingOption
            icon="person-circle-outline"
            label="Profile"
            onPress={() => router.push("/adminProfile")}
          />
          <SettingOption
            icon="pricetag-outline"
            label="Price Details"
            onPress={() => router.push("/priceDetails")}
          />
          <SettingOption
            icon="people-outline"
            label="Staff Settings"
            onPress={() => router.push("/staffPage")}
          />
          <SettingOption
            icon="print-outline"
            label="Printer Settings"
            onPress={() => router.push("/PrintBill")}
          />
        </View>
      </View>
    </AccessControl>
  );
};

const SettingOption = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.optionBox} onPress={onPress}>
    <View style={styles.optionLeft}>
      <Ionicons name={icon} size={28} color="#000" />
      <Text style={styles.optionText}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward-outline" size={24} color="#FFCD01" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  headerBox: {
    marginBottom: 16,
    marginHorizontal: 16,
    backgroundColor: "#f6f6f6",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#000",
    flex: 1,
  },
  headerSpacer: {
    width: 24,
  },

  section: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  optionBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF8C4",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  accessDeniedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ef4444",
  },
  accessDeniedSubtitle: {
    marginTop: 8,
    color: "#4B5563",
    textAlign: "center",
  },
});

export default AccountSettings;
