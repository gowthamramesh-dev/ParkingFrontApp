import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, ScrollView } from "react-native";
import userAuthStore from "@/utils/store";

const RevenueReportScreen = () => {
  const { revenueData, loading, error, fetchRevenueReport } = userAuthStore();

  useEffect(() => {
    fetchRevenueReport(); // ✅ Call the correct store function
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text style={{ color: "red" }}>{error}</Text>;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Staff Revenue Report
      </Text>
      <Text>Total Vehicles: {revenueData?.totalVehicles}</Text>
      <Text>Revenue: {revenueData?.revenue}</Text>

      {revenueData?.vehicles?.map((vehicle, index) => (
        <View
          key={index}
          style={{
            marginTop: 12,
            padding: 10,
            backgroundColor: "#f0f0f0",
            borderRadius: 8,
          }}
        >
          <Text>Name: {vehicle.name}</Text>
          <Text>Number Plate: {vehicle.numberPlate}</Text>
          <Text>Type: {vehicle.vehicleType}</Text>
          <Text>Amount: {vehicle.amount}</Text>
          <Text>Checked Out By: {vehicle.checkInBy}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default RevenueReportScreen;
