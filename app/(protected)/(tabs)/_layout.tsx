import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs, Link, router } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import userAuthStore from "@/utils/store";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenHeight = Dimensions.get("window").height;

function TopBar() {
  const { logOut, isLogged } = userAuthStore();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logOut();
          if (!isLogged) return router.replace("/login");
        },
      },
    ]);
  };
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    fetchUser();
  }, []);

  return (
    <View style={styles.topBarWrapper}>
      <View style={styles.greetingContainer}>
        <View style={styles.greetingBox}>
          <TouchableOpacity style={styles.backButton} onPress={handleLogout}>
            <Ionicons name="arrow-back" size={18} color="white" />
          </TouchableOpacity>
          <Text style={styles.greetingText}>Hi.. {user.username}</Text>
        </View>
        <Link href="/profile" style={styles.profileIcon}>
          <Ionicons name="person-circle-outline" size={36} color="black" />
        </Link>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView style={{ flex: 1, paddingBottom: 0 }}>
        <View style={{ height: screenHeight * 0.13, backgroundColor: "white" }}>
          <TopBar />
        </View>
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <Tabs
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarShowLabel: false,
              tabBarStyle: {
                backgroundColor: "#ffcd01",
                borderTopWidth: 0,
                height: 70,
                elevation: 8,
                borderTopRightRadius: 30,
                borderTopLeftRadius: 30,
              },
              tabBarItemStyle: {
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
              },
              tabBarIcon: ({ focused }) => {
                let iconName = "";
                let title = "";

                if (route.name === "index") {
                  iconName = "home";
                  title = "Home";
                } else if (route.name === "vehicleList") {
                  iconName = "bicycle";
                  title = "Vehicles";
                } else if (route.name === "todayReport") {
                  iconName = "calendar";
                  title = "Today";
                } else if (route.name === "monthlyPlan") {
                  iconName = "card";
                  title = "Pass";
                }

                if (focused) {
                  return (
                    <View style={styles.activeTab}>
                      <Ionicons name={iconName} size={24} color="black" />
                      <Text style={styles.activeTabText}>{title}</Text>
                    </View>
                  );
                }

                return (
                  <View style={styles.inactiveTab}>
                    <Ionicons name={iconName} size={20} color="black" />
                    <Text
                      style={styles.inactiveTabText}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {title}
                    </Text>
                  </View>
                );
              },
            })}
          >
            <Tabs.Screen name="index" options={{ tabBarLabel: () => null }} />
            <Tabs.Screen
              name="vehicleList"
              options={{ tabBarLabel: () => null }}
            />
            <Tabs.Screen
              name="todayReport"
              options={{ tabBarLabel: () => null }}
            />
            <Tabs.Screen
              name="monthlyPlan"
              options={{ tabBarLabel: () => null }}
            />
            {/* Hidden routes */}
            <Tabs.Screen name="adminProfile" options={{ href: null }} />
            <Tabs.Screen name="dashboard" options={{ href: null }} />
            <Tabs.Screen name="profile" options={{ href: null }} />
            <Tabs.Screen name="updateProfile" options={{ href: null }} />
            <Tabs.Screen name="priceDetails" options={{ href: null }} />
            <Tabs.Screen name="allStaffs" options={{ href: null }} />
            <Tabs.Screen name="AllStaffsScreen" options={{ href: null }} />
            <Tabs.Screen name="create" options={{ href: null }} />
            <Tabs.Screen name="permissionPage" options={{ href: null }} />
            <Tabs.Screen name="staffDetails" options={{ href: null }} />
            <Tabs.Screen name="staffPage" options={{ href: null }} />
            <Tabs.Screen name="staffRevenue" options={{ href: null }} />
            <Tabs.Screen name="staffVehicleList" options={{ href: null }} />
            <Tabs.Screen name="listPage" options={{ href: null }} />
          </Tabs>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBarWrapper: {
    backgroundColor: "#ffcd01",
    height: screenHeight * 0.1,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: "center",
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  greetingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 100,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: {
    backgroundColor: "#ffcd01",
    padding: 5,
    borderRadius: 100,
  },
  greetingText: {
    fontWeight: "bold",
    fontSize: 20,
    marginLeft: 10,
    color: "#333",
  },
  profileIcon: {
    backgroundColor: "white",
    borderRadius: 100,
    padding: 5,
    elevation: 4,
  },
  activeTab: {
    width: 70,
    height: 70,
    backgroundColor: "white",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 6,
  },

  activeTabText: {
    fontSize: 12,
    marginTop: 2,
    color: "black",
    fontWeight: "600",
  },
  inactiveTab: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    width: 70,
  },
  inactiveTabText: {
    fontSize: 12,
    marginTop: 2,
    color: "black",
    fontWeight: "500",
    textAlign: "center",
  },
});
