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
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Account Settings</Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.optionBox}
            onPress={() => router.push("/dashboard")}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="stats-chart-outline" size={30} color="#2d6a4f" />
              <Text style={styles.optionText}>Dashboard</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={25}
              color="#2d6a4f"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionBox}
            onPress={() => router.push("/adminProfile")}
          >
            <View style={styles.optionLeft}>
              <Ionicons
                name="person-circle-outline"
                size={30}
                color="#2d6a4f"
              />
              <Text style={styles.optionText}>Account</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={25}
              color="#2d6a4f"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionBox}
            onPress={() => router.push("/priceDetails")}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="pricetag-outline" size={30} color="#2d6a4f" />
              <Text style={styles.optionText}>Price Details</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={25}
              color="#2d6a4f"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionBox}
            onPress={() => router.push("/(protected)/(staff)/staffPage")}
          >
            <View style={styles.optionLeft}>
              <Ionicons name="people-outline" size={30} color="#2d6a4f" />
              <Text style={styles.optionText}>Staff Settings</Text>
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={25}
              color="#2d6a4f"
            />
          </TouchableOpacity>
        </View>
      </View>
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },

  headerBox: {
    marginVertical: 16,
    marginHorizontal: 16,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
  },
  headerSpacer: { width: 48 },

  section: { marginHorizontal: 16, marginVertical: 16 },

  optionBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ecfdf5",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#065f46",
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
