import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import userAuthStore from "@/utils/store";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AccessControl from "@/components/AccessControl";

const AccountSettings = () => {
  const router = useRouter();
  const { user } = userAuthStore();
  const parsedUser = typeof user === "string" ? JSON.parse(user) : user;

  const navigation = useNavigation();

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
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={28} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Staff Settings</Text>
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
  header: {
    backgroundColor: "white",
    borderRadius: 4,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: "50%",
    marginTop: -14, // To vertically center 28px icon
  },
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
