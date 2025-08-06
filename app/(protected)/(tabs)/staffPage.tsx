import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AccessControl from "@/components/AccessControl";

const StaffSettings = () => {
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
      <View style={styles.container}>
        <View style={styles.headerBox}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.push("/(protected)/(tabs)/profile")}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Staff Settings</Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        <View style={styles.section}>
          {menuItems.map(({ label, icon, route }, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.optionBox}
              onPress={() => router.push(route)}
            >
              <View style={styles.optionLeft}>
                <Ionicons name={icon} size={28} color="#000" />
                <Text style={styles.optionText}>{label}</Text>
              </View>
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="#FFCD01"
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </AccessControl>
  );
};

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
});

export default StaffSettings;
