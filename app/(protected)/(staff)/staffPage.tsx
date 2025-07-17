import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import userAuthStore from "@/utils/store";

const AccountSettings = () => {
  const router = useRouter();
  const { user } = userAuthStore();
  const parsedUser = typeof user === "string" ? JSON.parse(user) : user;

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
    <SafeAreaView style={styles.safeArea}>
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
  );
};

const styles = StyleSheet.create({
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
