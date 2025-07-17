import {
  Dimensions,
  Text,
  View,
  ScrollView,
  FlatList,
  RefreshControl,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { ProgressChart } from "react-native-chart-kit";
import userAuthStore from "@/utils/store";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

const screenWidth = Dimensions.get("window").width;
const chartWidth = screenWidth * 0.95;

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

const prepareChartData = (dataObject: any) => {
  const types = Object.keys(dataObject);
  const counts = Object.values(dataObject) as number[];

  const labels = types.map((type, i) => `${counts[i]} ${type}`);

  const max = Math.max(...counts, 1);
  const normalizedData = counts.map((count) => count / max);

  return {
    labels,
    data: normalizedData,
  };
};

const ChartSection = ({ title, data }: any) => (
  <Animated.View
    entering={FadeInDown.duration(500)}
    style={styles.chartSection}
  >
    <Text style={styles.chartTitle}>{title}</Text>
    <LinearGradient
      colors={["#f0fdf4", "#dcfce7"]}
      style={styles.chartContainer}
    >
      <ProgressChart
        data={prepareChartData(data)}
        width={chartWidth}
        height={220}
        strokeWidth={14}
        radius={32}
        chartConfig={chartConfig}
        hideLegend={false}
      />
    </LinearGradient>
  </Animated.View>
);

const TodayReport = () => {
  const {
    hydrated,
    getTodayVehicles,
    checkins,
    checkouts,
    allData,
    VehicleTotalMoney,
    PaymentMethod,
  } = userAuthStore();

  const [vehicleList, setVehicleList] = useState<
    {
      vehicle: string;
      checkin: number;
      checkout: number;
      total: number;
      money: number;
    }[]
  >([]);
  const [paymentMethod, setPaymentMethod] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getTodayVehicles();
    setRefreshing(false);
  }, [getTodayVehicles]);

  useEffect(() => {
    if (hydrated) {
      getTodayVehicles();
    }
  }, [hydrated]);

  useEffect(() => {
    const vehicleTypes = Array.from(
      new Set([
        ...Object.keys(checkins || {}),
        ...Object.keys(checkouts || {}),
        ...Object.keys(allData || {}),
        ...Object.keys(VehicleTotalMoney || {}),
      ])
    );

    const updatedVehicleList = vehicleTypes.map((type) => ({
      vehicle: type,
      checkin: checkins?.[type] || 0,
      checkout: checkouts?.[type] || 0,
      total: allData?.[type] || 0,
      money: VehicleTotalMoney?.[type] || 0,
    }));

    const paymentList = Object.entries(PaymentMethod || {}).map(
      ([method, amount]) => ({
        method,
        amount,
      })
    );

    setVehicleList(updatedVehicleList);
    setPaymentMethod(paymentList);
  }, [checkins, checkouts, allData, VehicleTotalMoney, PaymentMethod]);

  return (
    <LinearGradient colors={["#f3f4f6", "#e5e7eb"]} style={styles.container}>
      <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
        <Text style={styles.headerText}>Today&apos;s Report</Text>
      </Animated.View>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.sliderContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
          >
            <ChartSection title="All Vehicles" data={allData} />
            <ChartSection title="Check In" data={checkins} />
            <ChartSection title="Check Out" data={checkouts} />
          </ScrollView>
        </View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          style={styles.tableContainer}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vehicles</Text>
          </View>
          <View style={styles.tableWrapper}>
            {Array.isArray(vehicleList) && vehicleList.length > 0 ? (
              <FlatList
                data={vehicleList}
                keyExtractor={(item) => item.vehicle}
                ListHeaderComponent={() => (
                  <View style={styles.tableHeaderRow}>
                    <Text style={styles.tableHeaderCell}>Vehicle</Text>
                    <Text style={styles.tableHeaderCell}>IN</Text>
                    <Text style={styles.tableHeaderCell}>Out</Text>
                    <Text style={styles.tableHeaderCell}>All</Text>
                    <Text style={styles.tableHeaderCell}>Money</Text>
                  </View>
                )}
                renderItem={({ item, index }) => (
                  <Animated.View
                    entering={FadeInDown.duration(400).delay(index * 100)}
                    style={styles.tableRow}
                  >
                    <Text style={styles.tableCell}>{item.vehicle}</Text>
                    <Text style={styles.tableCell}>{item.checkin}</Text>
                    <Text style={styles.tableCell}>{item.checkout}</Text>
                    <Text style={styles.tableCell}>{item.total}</Text>
                    <Text style={styles.moneyCell}>₹{item.money}</Text>
                  </Animated.View>
                )}
              />
            ) : (
              <Text style={styles.emptyText}>No vehicle data available</Text>
            )}
          </View>
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Payment Methods</Text>
            </View>
            {Array.isArray(paymentMethod) && paymentMethod.length > 0 ? (
              <FlatList
                data={paymentMethod}
                keyExtractor={(item) => item.method}
                ListHeaderComponent={() => (
                  <View style={styles.paymentHeaderRow}>
                    <Text style={styles.paymentHeaderCell}>Payment</Text>
                    <Text style={styles.paymentHeaderCell}>Money</Text>
                  </View>
                )}
                renderItem={({ item, index }) => (
                  <Animated.View
                    entering={FadeInDown.duration(400).delay(index * 100)}
                    style={styles.paymentRow}
                  >
                    <Text style={styles.paymentCell}>{item.method}</Text>
                    <Text style={styles.moneyCell}>₹{item.amount}</Text>
                  </Animated.View>
                )}
              />
            ) : (
              <Text style={styles.emptyText}>No payment data</Text>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginVertical: 16,
    marginHorizontal: 16,
    backgroundColor: "white",
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    elevation: 4,
  },
  headerText: { fontSize: 22, fontWeight: "bold", color: "#111827" },
  sliderContainer: { paddingBottom: 24 },
  chartSection: {
    width: screenWidth,
    alignItems: "center",
    paddingVertical: 10,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  chartContainer: {
    borderRadius: 4,
    padding: 12,
    elevation: 2,
    shadowColor: "#bbf7d0",
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  tableContainer: {
    marginHorizontal: 16,
    backgroundColor: "white",
    borderRadius: 5,
    elevation: 4,
    paddingBottom: 16,
    marginBottom: 16,
  },
  sectionHeader: { padding: 10, alignItems: "center" },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#1f2937" },
  tableWrapper: { paddingBottom: 16 },
  tableHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#d1fae5",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    marginHorizontal: 8,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tableHeaderCell: {
    width: "20%",
    textAlign: "center",
    fontWeight: "bold",
    color: "#1f2937",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
    marginHorizontal: 8,
  },
  tableCell: {
    width: "20%",
    textAlign: "center",
    color: "#374151",
    fontWeight: "500",
  },
  moneyCell: {
    width: "20%",
    textAlign: "center",
    color: "#16a34a",
    fontWeight: "500",
  },
  paymentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#d1fae5",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    marginHorizontal: 8,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  paymentHeaderCell: {
    width: "50%",
    textAlign: "center",
    fontWeight: "bold",
    color: "#1f2937",
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
    marginHorizontal: 8,
  },
  paymentCell: {
    width: "50%",
    textAlign: "center",
    color: "#374151",
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    padding: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
});

export default TodayReport;
