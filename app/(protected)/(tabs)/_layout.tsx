import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs, Link, Redirect } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import userAuthStore from "@/utils/store";
import React from "react";

function TopBar() {
  const { logOut, isLogged } = userAuthStore();

  const handleLogout = async () => {
    await logOut();
    if (!isLogged) {
      return <Redirect href="/login" />;
    }
  };

  return (
    <View style={styles.topBarWrapper}>
      <View style={styles.topBarContainer}>
        <View style={styles.titleWrapper}>
          <Link href="/profile">
            <Ionicons name="person-circle-outline" size={40} />
          </Link>
          <Text style={styles.titleText}>Parking App</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#3CDF70" }}>
        <View style={{ paddingHorizontal: 16 }}>
          <TopBar />
        </View>

        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#3CDF70",
            tabBarStyle: {
              alignItems: "center",
              backgroundColor: "#ffffff",
              borderTopWidth: 1,
              borderTopColor: "#E5E7EB",
              height: 60,
              paddingBottom: 0,
              marginBottom: 0,
              position: "absolute",
              bottom: 0,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="vehicleList"
            options={{
              title: "Vehicles",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="bicycle" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="todayReport"
            options={{
              title: "Today",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="document" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="monthlyPlan"
            options={{
              title: "Pass",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="card" size={size} color={color} />
              ),
            }}
          />

          {/* Hidden routes */}
          <Tabs.Screen name="adminProfile" options={{ href: null }} />
          <Tabs.Screen name="dashboard" options={{ href: null }} />
          <Tabs.Screen name="profile" options={{ href: null }} />
          <Tabs.Screen name="staffs" options={{ href: null }} />
          <Tabs.Screen name="updateProfile" options={{ href: null }} />
          <Tabs.Screen name="priceDetails" options={{ href: null }} />
        </Tabs>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarContainer: {
    backgroundColor: "white",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
    padding: 10,
    borderRadius: 4,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "800",
  },
});
