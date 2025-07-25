import React, { useEffect, useState } from "react";
import {
  StatusBar,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import StaffVehicleList from "@/app/(protected)/(staff)/staffVehicleList";
import StaffRevenue from "@/app/(protected)/(staff)/staffRevenue";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import PermissionPage from "./(protected)/(staff)/permissionPage";
import { useLocalSearchParams } from "expo-router";
import AccessControl from "@/components/AccessControl";

const Index = () => {
  const [activeTab, setActiveTab] = useState("vehiclelist");
  const [user, setUser] = useState({});
  const navigation = useNavigation();
  const { staffId } = useLocalSearchParams();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    fetchUser();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "vehiclelist":
        return <StaffVehicleList />;
      case "revenue":
        return <StaffRevenue />;
      case "permission":
        return <PermissionPage id={staffId} />;
      default:
        return <StaffVehicleList />;
    }
  };

  return (
    <AccessControl required="InStaff">
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <StatusBar
            backgroundColor="transparent"
            translucent
            barStyle="dark-content"
          />
          <View style={styles.container}>
            <View style={styles.headerBox}>
              <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Ionicons name="arrow-back" size={28} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Staff Report</Text>
                <View style={styles.headerSpacer} />
              </View>
            </View>

            <View style={styles.tabWrapper}>
              <View style={styles.tabRow}>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === "vehiclelist"
                      ? styles.vehicleTabActive
                      : styles.tabInactive,
                  ]}
                  onPress={() => setActiveTab("vehiclelist")}
                >
                  <Text style={styles.tabText}>Vehicle List</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === "revenue"
                      ? styles.revenueTabActive
                      : styles.tabInactive,
                  ]}
                  onPress={() => setActiveTab("revenue")}
                >
                  <Text style={styles.tabText}>Revenue</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    activeTab === "permission"
                      ? styles.revenueTabActive
                      : styles.tabInactive,
                  ]}
                  onPress={() => setActiveTab("permission")}
                >
                  <Text style={styles.tabText}>Permissions</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Content */}
            <View style={styles.contentContainer}>
              <ScrollView>{renderTabContent()}</ScrollView>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F3F4F6",
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
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
  tabWrapper: {
    backgroundColor: "#fff",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    borderColor: "#fff",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  vehicleTabActive: {
    backgroundColor: "#60A5FA", // Tailwind blue-400
  },
  revenueTabActive: {
    backgroundColor: "#FACC15", // Tailwind yellow-400
  },
  tabInactive: {
    backgroundColor: "#D1D5DB", // Tailwind gray-300
  },
  tabText: {
    fontSize: 16,
    color: "#111827", // Tailwind gray-900
  },
  contentContainer: {
    flex: 1,
  },
});

export default Index;
