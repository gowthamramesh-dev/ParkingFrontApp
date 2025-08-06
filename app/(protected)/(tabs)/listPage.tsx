import React, { useEffect, useState } from "react";
import {
  StatusBar,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import StaffVehicleList from "./staffVehicleList";
import StaffRevenue from "./staffRevenue";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import PermissionPage from "./permissionPage";
import { router, useLocalSearchParams } from "expo-router";
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
      <View style={styles.container}>
        <StatusBar
          backgroundColor="transparent"
          translucent
          barStyle="dark-content"
        />
        <View style={styles.headerBox}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.push("/(protected)/(tabs)/allStaffs")}
            >
              <Ionicons name="arrow-back" size={26} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Staff Report</Text>
            <View style={{ width: 26 }} />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabWrapper}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "vehiclelist"
                ? styles.activeTab
                : styles.inactiveTab,
            ]}
            onPress={() => setActiveTab("vehiclelist")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "vehiclelist" && styles.tabTextActive,
              ]}
            >
              Vehicle List
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "revenue" ? styles.activeTab : styles.inactiveTab,
            ]}
            onPress={() => setActiveTab("revenue")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "revenue" && styles.tabTextActive,
              ]}
            >
              Revenue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "permission"
                ? styles.activeTab
                : styles.inactiveTab,
            ]}
            onPress={() => setActiveTab("permission")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "permission" && styles.tabTextActive,
              ]}
            >
              Permissions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <ScrollView
            style={{
              flex: 1,
              flexGrow: 1,
              borderRadius: 16,
            }}
            showsVerticalScrollIndicator={false}
          >
            {renderTabContent()}
          </ScrollView>
        </View>
      </View>
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 16,
  },
  headerBox: {
    backgroundColor: "#f6f6f6",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },

  tabWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F6F6F6",
    borderRadius: 32,
    padding: 6,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 32,
  },
  activeTab: {
    backgroundColor: "#FFCD01",
  },
  inactiveTab: {
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#000",
  },
  contentContainer: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ffcd01",
  },
});

export default Index;
