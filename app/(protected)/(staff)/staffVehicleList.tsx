import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import userAuthStore from "@/utils/store";

const screenWidth = Dimensions.get("window").width;
const chartWidth = screenWidth * 0.93;

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(0, 200, 83, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0,
  useShadowColorFromDataset: false,
  propsForBackgroundLines: {
    stroke: "#e0e0e0",
  },
};

const ChartSection = ({ title, data }) => {
  const types = Object.keys(data || {});
  const counts = Object.values(data || {});
  const labels = types.map((type, i) => `${counts[i]} ${type}`);
  const max = Math.max(...counts, 1);
  const normalizedData = counts.map((count) => count / max);

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.chartBox}>
        <ProgressChart
          data={{ labels, data: normalizedData }}
          width={chartWidth}
          height={220}
          strokeWidth={13}
          radius={30}
          chartConfig={chartConfig}
          hideLegend={false}
        />
      </View>
    </View>
  );
};

const TodayReport = () => {
  const { report, fetchRevenueReport } = userAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await fetchRevenueReport();
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="green" />
        <Text style={styles.loaderText}>Loading today's report...</Text>
      </View>
    );
  }

  const vehicleList = report?.vehicles || [];
  const revenue = report?.revenue || "₹0.00";
  const totalVehicles = report?.totalVehicles || 0;
  const role = report?.role || "N/A";

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Today Report</Text>
        <Text style={styles.roleText}>Role: {role}</Text>
        <Text style={styles.revenueText}>
          Revenue: {revenue} | Vehicles: {totalVehicles}
        </Text>
      </View>

      <ScrollView>
        <View style={styles.vehicleListBox}>
          <View style={styles.vehicleListHeader}>
            <Text style={styles.columnHeader}>Vehicle</Text>
            <Text style={styles.columnHeader}>Type</Text>
            <Text style={styles.columnHeader}>Amount</Text>
            <Text style={styles.columnHeader}>By</Text>
          </View>

          <FlatList
            data={vehicleList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.vehicleRow}>
                <Text style={styles.cell}>{item.numberPlate}</Text>
                <Text style={styles.cell}>{item.vehicleType}</Text>
                <Text style={styles.cell}>{item.amount}</Text>
                <Text style={styles.cell}>{item.createdBy}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No vehicle data available</Text>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loaderText: {
    marginTop: 8,
    color: "#6B7280",
  },
  headerBox: {
    marginVertical: 16,
    marginHorizontal: 16,
    backgroundColor: "white",
    alignItems: "center",
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  roleText: {
    color: "#6B7280",
  },
  revenueText: {
    color: "#16A34A",
    fontWeight: "600",
  },
  chartContainer: {
    width: screenWidth,
    alignItems: "center",
    paddingVertical: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  chartBox: {
    borderRadius: 8,
    shadowColor: "#A7F3D0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  vehicleListBox: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 1,
  },
  vehicleListHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#86efac",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  vehicleRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  columnHeader: {
    width: "25%",
    textAlign: "center",
    fontWeight: "bold",
  },
  cell: {
    width: "25%",
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    padding: 16,
    color: "#6B7280",
  },
});

export default TodayReport;
