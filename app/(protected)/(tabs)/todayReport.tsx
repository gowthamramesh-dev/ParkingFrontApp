import {
  Dimensions,
  Text,
  View,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { ProgressChart } from "react-native-chart-kit";
import PagerView from "react-native-pager-view";
import userAuthStore from "@/utils/store";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import AccessControl from "@/components/AccessControl";

const screenWidth = Dimensions.get("window").width;
const chartWidth = screenWidth * 0.95;
const chartConfig = {
  backgroundGradientFrom: "#f6f6f6",
  backgroundGradientTo: "#f6f6f6",
  color: (opacity = 1) => `rgba(255, 205, 1, ${opacity})`,
  strokeWidth: 12,
  barPercentage: 0.7,
  useShadowColorFromDataset: false,
  propsForBackgroundLines: {
    stroke: "#cccccc",
  },
  labelColor: () => "#666666",
};

const prepareChartData = (data: any) => {
  // Handle case where data is undefined, null, or not an object/array
  if (!data || (typeof data !== "object" && !Array.isArray(data))) {
    return {
      labels: ["No data"],
      data: [0],
    };
  }

  let types: string[] = [];
  let counts: number[] = [];

  if (Array.isArray(data)) {
    // If data is an array of objects, aggregate by vehicleType
    const aggregated = data.reduce(
      (acc, item) => {
        const vehicleType = item?.vehicleType || "Unknown";
        acc[vehicleType] = (acc[vehicleType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    types = Object.keys(aggregated);
    counts = Object.values(aggregated);
  } else if (typeof data === "object") {
    // If data is an object with vehicle types as keys
    types = Object.keys(data);
    counts = Object.values(data).map((val) =>
      typeof val === "number"
        ? val
        : typeof val === "object" && val !== null && "count" in val
          ? Number(val.count)
          : 0
    );
  }

  if (types.length === 0) {
    return {
      labels: ["No data"],
      data: [0],
    };
  }

  const labels = types.map((type, i) => `${counts[i] || 0} ${type}`);
  const max = Math.max(...counts, 1);
  const normalizedData = counts.map((count) =>
    Number.isFinite(count) ? count / max : 0
  );

  return {
    labels,
    data: normalizedData,
  };
};

const ChartSection = ({ title, data }: { title: string; data: any }) => (
  <Animated.View
    entering={FadeInDown.duration(500)}
    style={styles.chartSection}
  >
    <Text style={styles.chartTitle}>{title}</Text>
    <View style={styles.chartContainer}>
      <ProgressChart
        data={prepareChartData(data)}
        width={chartWidth}
        height={220}
        strokeWidth={14}
        radius={32}
        chartConfig={chartConfig}
        hideLegend={false}
        style={{ borderRadius: 20 }}
      />
    </View>
  </Animated.View>
);

const TodayReport = () => {
  const navigation = useNavigation<any>();
  const {
    hydrated,
    getTodayVehicles,
    checkins,
    checkouts,
    allData,
    VehicleTotalMoney,
    PaymentMethod,
  } = userAuthStore();

  const [vehicleList, setVehicleList] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<any[]>([]);

  useEffect(() => {
    if (hydrated) {
      getTodayVehicles();
    }
  }, [hydrated, getTodayVehicles]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", () => {
      if (hydrated) getTodayVehicles();
    });
    return unsubscribe;
  }, [navigation, hydrated, getTodayVehicles]);

  useEffect(() => {
    // Process vehicle data
    const aggregateByType = (data: any) => {
      if (Array.isArray(data)) {
        return data.reduce(
          (acc, item) => {
            const vehicleType = item?.vehicleType || "Unknown";
            acc[vehicleType] = (acc[vehicleType] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );
      }
      return data || {};
    };

    const checkinsAgg = aggregateByType(checkins);
    const checkoutsAgg = aggregateByType(checkouts);
    const allDataAgg = aggregateByType(allData);
    const moneyAgg = VehicleTotalMoney || {};

    const vehicleTypes = Array.from(
      new Set([
        ...Object.keys(checkinsAgg),
        ...Object.keys(checkoutsAgg),
        ...Object.keys(allDataAgg),
        ...Object.keys(moneyAgg),
      ])
    );

    const updatedVehicleList = vehicleTypes.map((type) => ({
      vehicle: type,
      checkin: checkinsAgg[type] || 0,
      checkout: checkoutsAgg[type] || 0,
      total: allDataAgg[type] || 0,
      money: moneyAgg[type] || 0,
    }));

    // Process payment methods
    const paymentList = Array.isArray(PaymentMethod)
      ? PaymentMethod.map((item) => ({
          method: item?.method || "Unknown",
          amount: Number(item?.amount) || 0,
        }))
      : Object.entries(PaymentMethod || {}).map(([method, amount]) => ({
          method,
          amount: Number(amount) || 0,
        }));

    setVehicleList(updatedVehicleList);
    setPaymentMethod(paymentList);
  }, [checkins, checkouts, allData, VehicleTotalMoney, PaymentMethod]);

  return (
    <AccessControl required="todayReport">
      <ScrollView style={styles.container}>
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={styles.header}
        >
          <Text style={styles.headerText}>Today's Report</Text>
        </Animated.View>

        <PagerView style={styles.pagerView} initialPage={0}>
          <View key="1">
            <ChartSection title="All Vehicles" data={allData} />
          </View>
          <View key="2">
            <ChartSection title="Check In" data={checkins} />
          </View>
          <View key="3">
            <ChartSection title="Check Out" data={checkouts} />
          </View>
        </PagerView>

        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>Vehicles</Text>
          {vehicleList.length > 0 ? (
            <FlatList
              data={vehicleList}
              keyExtractor={(item) => item.vehicle || Math.random().toString()}
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
                  <Text style={styles.tableCell}>{item.vehicle || "N/A"}</Text>
                  <Text style={styles.tableCell}>{item.checkin || 0}</Text>
                  <Text style={styles.tableCell}>{item.checkout || 0}</Text>
                  <Text style={styles.tableCell}>{item.total || 0}</Text>
                  <Text style={styles.moneyCell}>₹{item.money || 0}</Text>
                </Animated.View>
              )}
            />
          ) : (
            <Text style={styles.emptyText}>No vehicle data available</Text>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(300)}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>Payment Methods</Text>
          {paymentMethod.length > 0 ? (
            <FlatList
              data={paymentMethod}
              keyExtractor={(item) => item.method || Math.random().toString()}
              ListHeaderComponent={() => (
                <View style={styles.tableHeaderRow}>
                  <Text style={styles.paymentHeaderCell}>Payment</Text>
                  <Text style={styles.paymentHeaderCell}>Money</Text>
                </View>
              )}
              renderItem={({ item, index }) => (
                <Animated.View
                  entering={FadeInDown.duration(400).delay(index * 100)}
                  style={styles.tableRow}
                >
                  <Text style={styles.paymentCell}>{item.method || "N/A"}</Text>
                  <Text style={styles.moneyCell}>₹{item.amount || 0}</Text>
                </Animated.View>
              )}
            />
          ) : (
            <Text style={styles.emptyText}>No payment data</Text>
          )}
        </Animated.View>
      </ScrollView>
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "white" },
  header: {
    marginHorizontal: 16,
    backgroundColor: "#f6f6f6",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    marginBottom: 5,
    elevation: 3,
  },
  headerText: { fontSize: 22, fontWeight: "bold", color: "#111" },
  pagerView: {
    height: 320,
    marginBottom: 10,
  },
  chartSection: {
    alignItems: "center",
    paddingVertical: 10,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  chartContainer: {
    borderRadius: 20,
    backgroundColor: "#f6f6f6",
    borderWidth: 1,
    borderColor: "#ffed01",
    elevation: 3,
  },
  card: {
    backgroundColor: "#f6f6f6",
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 16,
    elevation: 4,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 16,
    textAlign: "center",
  },
  tableHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ffcd01",
    paddingVertical: 12,
    borderRadius: 10,
  },
  tableHeaderCell: {
    width: "20%",
    textAlign: "center",
    fontWeight: "bold",
    color: "#000",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
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
    color: "#000",
    fontWeight: "800",
  },
  paymentHeaderCell: {
    width: "50%",
    textAlign: "center",
    fontWeight: "bold",
    color: "#000",
  },
  paymentCell: {
    width: "50%",
    textAlign: "center",
    color: "#374151",
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    paddingVertical: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
});

export default TodayReport;
