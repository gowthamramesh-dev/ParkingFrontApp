import React from "react";
import { Text, TouchableOpacity, SafeAreaView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AccessControl from "@/components/AccessControl";

const StaffDetails = () => {
  const { staffId, username } = useLocalSearchParams();
  const router = useRouter();

  return (
    <AccessControl required="staffDetails">
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.staffName}>👤 {username}</Text>

        <TouchableOpacity
          style={styles.buttonVehicle}
          onPress={() =>
            router.push({
              pathname: "/(protected)/(tabs)/vehicleList",
              params: { staffId, username },
            })
          }
        >
          <Text style={styles.buttonText}>🚗 Vehicle List</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonReport}
          onPress={() =>
            router.push({
              pathname: "/(protected)/(tabs)/todayReport",
              params: { staffId, username },
            })
          }
        >
          <Text style={styles.buttonText}>📊 Today Report</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  staffName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 32,
  },
  buttonVehicle: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonReport: {
    backgroundColor: "#16A34A",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
});

export default StaffDetails;
