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

const Index = () => {
  const [activeTab, setActiveTab] = useState("vehiclelist");
  const [user, setUser] = useState({});
  const navigation = useNavigation();

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
      default:
        return <StaffVehicleList />;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <StatusBar
          backgroundColor="transparent"
          translucent
          barStyle="dark-content"
        />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Staff Report</Text>
          </View>
          <View></View>
          {/* Tabs */}
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
            </View>
          </View>
          {/* Content */}
          <View style={styles.contentContainer}>
            <ScrollView>{renderTabContent()}</ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F3F4F6",
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
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
