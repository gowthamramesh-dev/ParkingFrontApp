import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AccessControl from "@/components/AccessControl";

const AccountSettings = () => {
  const router = useRouter();

  const menuItems = [
    {
      label: "Edit/Delete Staff",
      icon: "people-outline",
      route: "/AllStaffsScreen",
    },
    {
      label: "Create New Staff",
      icon: "person-add-outline",
      route: "/create",
    },
    {
      label: "View Staff List",
      icon: "create-outline",
      route: "/allStaffs",
    },
  ];

  return (
    <AccessControl required="staffSettings">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerBox}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.push("/(protected)/(tabs)/profile")}
            >
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Staff Settings</Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>
        <View>
          {menuItems.map(({ label, icon, route }, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => router.push(route)}
              style={styles.menuItem}
            >
              <View style={styles.menuLeft}>
                <Ionicons name={icon} size={28} color="#2d6a4f" />
                <Text style={styles.menuLabel}>{label}</Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="#2d6a4f"
              />
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  headerBox: {
    marginVertical: 16,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  headerSpacer: { width: 48 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937", // Tailwind gray-800
  },

  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ecfdf5",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuLabel: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#065f46",
  },
});

export default AccountSettings;
