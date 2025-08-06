import {
  Dimensions,
  Text,
  View,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import { ProgressChart, PieChart } from "react-native-chart-kit";
import PagerView from "react-native-pager-view";
import userAuthStore from "@/utils/store";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    marginBottom: 16,
    marginHorizontal: 16,
    backgroundColor: "#f6f6f6",
    padding: 16,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  title: {
    width: 24,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
    color: "#1f2937",
  },
  pagerView: {
    height: 320,
    marginBottom: 10,
  },
  tableContainer: {
    backgroundColor: "#f6f6f6",
    marginHorizontal: 16,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ffcd01",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginHorizontal: 8,
  },
  tableHeaderText: {
    fontWeight: "800",
    color: "#000",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    marginHorizontal: 8,
  },
  tableRowText: {
    color: "#374151",
    fontWeight: "500",
    textAlign: "center",
  },
  tableRowMoney: {
    color: "#000",
    fontWeight: "800",
    textAlign: "center",
  },
  noData: {
    textAlign: "center",
    padding: 16,
    color: "#6b7280",
    fontWeight: "500",
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
});

const prepareChartData = (dataObject: any) => {
  if (!dataObject || Object.keys(dataObject).length === 0) {
    return {
      labels: ["No data"],
      data: [0],
    };
  }

  const types = Object.keys(dataObject);
  const rawCounts = Object.values(dataObject);

  const counts = rawCounts.map((val) => {
    const num = Number(val);
    return Number.isFinite(num) && num >= 0 ? num : 0;
  });

  const labels = types.map((type, i) => `${counts[i]} ${type}`);
  const max = Math.max(...counts, 1);
  const normalizedData = counts.map((count) => count / max);

  return {
    labels: labels.length > 0 ? labels : ["No data"],
    data: normalizedData.map((n) => (Number.isFinite(n) ? n : 0)),
  };
};

const ChartSection = ({ title, data }: any) => (
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

const PieChartSection = ({ title, data }: { title: string; data: any[] }) => {
  if (!data || data.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#6b7280" }}>No data available</Text>
      </View>
    );
  }
  return (
    <Animated.View
      entering={FadeInDown.duration(500)}
      style={styles.chartSection}
    >
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.chartContainer}>
        <PieChart
          data={data}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
          style={{ borderRadius: 20 }}
        />
      </View>
    </Animated.View>
  );
};

const TodayReport = () => {
  const navigation = useNavigation<any>();

  const {
    hydrated,
    getDashboardData,
    checkins,
    checkouts,
    allData,
    VehicleTotalMoney,
    PaymentMethod,
    staffData,
    transactionLogs,
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
  const [paymentMethod, setPaymentMethod] = useState<
    { method: string; amount: number }[]
  >([]);

  useEffect(() => {
    if (hydrated) {
      getDashboardData();
    }
  }, [hydrated, getDashboardData]);

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
        amount: Number(amount) || 0,
      })
    );

    setVehicleList(updatedVehicleList);
    setPaymentMethod(paymentList);
  }, [checkins, checkouts, allData, VehicleTotalMoney, PaymentMethod]);

  const revenueChartData = useMemo(() => {
    return Object.entries(VehicleTotalMoney || {}).map(
      ([type, money], index) => ({
        name: type,
        population: Number(money) || 0,
        color: `hsl(${index * 60}, 70%, 50%)`,
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      })
    );
  }, [VehicleTotalMoney]);

  const staffChartData = useMemo(() => {
    return (staffData || []).map((staff, index) => ({
      name: staff.username || "Unknown",
      population: staff.checkIns || 0,
      color: `hsl(${index * 60}, 70%, 50%)`,
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    }));
  }, [staffData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", () => {
      if (hydrated) {
        getDashboardData();
      }
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <AccessControl required="dashboard">
      <ScrollView style={styles.container}>
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.push("/(protected)/(tabs)/profile")}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>Admin Dashboard</Text>
          </View>
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
          <View key="4">
            <PieChartSection
              title="Revenue by Vehicle"
              data={revenueChartData}
            />
          </View>
          <View key="5">
            <PieChartSection title="Staff Check-Ins" data={staffChartData} />
          </View>
        </PagerView>

        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          style={styles.tableContainer}
        >
          <View
            style={{
              padding: 16,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#374151" }}
            >
              Vehicles
            </Text>
          </View>
          {Array.isArray(vehicleList) && vehicleList.length > 0 ? (
            <FlatList
              data={vehicleList}
              keyExtractor={(item) => item.vehicle}
              ListHeaderComponent={() => (
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { width: "20%" }]}>
                    Vehicle
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: "20%" }]}>
                    IN
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: "20%" }]}>
                    Out
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: "20%" }]}>
                    All
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: "20%" }]}>
                    Money
                  </Text>
                </View>
              )}
              renderItem={({ item, index }) => (
                <Animated.View
                  entering={FadeInDown.duration(400).delay(index * 100)}
                  style={styles.tableRow}
                >
                  <Text style={[styles.tableRowText, { width: "20%" }]}>
                    {item.vehicle}
                  </Text>
                  <Text style={[styles.tableRowText, { width: "20%" }]}>
                    {item.checkin}
                  </Text>
                  <Text style={[styles.tableRowText, { width: "20%" }]}>
                    {item.checkout}
                  </Text>
                  <Text style={[styles.tableRowText, { width: "20%" }]}>
                    {item.total}
                  </Text>
                  <Text style={[styles.tableRowMoney, { width: "20%" }]}>
                    ₹{item.money}
                  </Text>
                </Animated.View>
              )}
            />
          ) : (
            <Text style={styles.noData}>No vehicle data available</Text>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(400)}
          style={styles.tableContainer}
        >
          <View
            style={{
              padding: 16,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#374151" }}
            >
              Payment Methods
            </Text>
          </View>
          {Array.isArray(paymentMethod) && paymentMethod.length > 0 ? (
            <FlatList
              data={paymentMethod}
              keyExtractor={(item) => item.method}
              ListHeaderComponent={() => (
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { width: "50%" }]}>
                    Payment
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: "50%" }]}>
                    Money
                  </Text>
                </View>
              )}
              renderItem={({ item, index }) => (
                <Animated.View
                  entering={FadeInDown.duration(400).delay(index * 100)}
                  style={styles.tableRow}
                >
                  <Text style={[styles.tableRowText, { width: "50%" }]}>
                    {item.method}
                  </Text>
                  <Text style={[styles.tableRowMoney, { width: "50%" }]}>
                    ₹{item.amount}
                  </Text>
                </Animated.View>
              )}
            />
          ) : (
            <Text style={styles.noData}>No payment data available</Text>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(600)}
          style={styles.tableContainer}
        >
          <View
            style={{
              padding: 16,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#374151" }}
            >
              Staff Performance
            </Text>
          </View>
          {Array.isArray(staffData) && staffData.length > 0 ? (
            <FlatList
              data={staffData}
              keyExtractor={(item) => item.username}
              ListHeaderComponent={() => (
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { width: "25%" }]}>
                    Staff
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: "25%" }]}>
                    Check-Ins
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: "25%" }]}>
                    Check-Outs
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: "25%" }]}>
                    Revenue
                  </Text>
                </View>
              )}
              renderItem={({ item, index }) => (
                <Animated.View
                  entering={FadeInDown.duration(400).delay(index * 100)}
                  style={styles.tableRow}
                >
                  <Text style={[styles.tableRowText, { width: "25%" }]}>
                    {item.username || "Unknown"}
                  </Text>
                  <Text style={[styles.tableRowText, { width: "25%" }]}>
                    {item.checkIns || 0}
                  </Text>
                  <Text style={[styles.tableRowText, { width: "25%" }]}>
                    {item.checkOuts || 0}
                  </Text>
                  <Text style={[styles.tableRowMoney, { width: "25%" }]}>
                    ₹{item.revenue || 0}
                  </Text>
                </Animated.View>
              )}
            />
          ) : (
            <Text style={styles.noData}>No staff data available</Text>
          )}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(800)}
          style={styles.tableContainer}
        >
          <View
            style={{
              padding: 16,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#374151" }}
            >
              Transaction Logs
            </Text>
          </View>
          {Array.isArray(transactionLogs) && transactionLogs.length > 0 ? (
            <ScrollView horizontal>
              <View>
                <View
                  style={[
                    styles.tableHeader,
                    { flexDirection: "row", paddingVertical: 12 },
                  ]}
                >
                  <Text style={[styles.tableHeaderText, { width: 80 }]}>
                    ID
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: 80 }]}>
                    Type
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: 80 }]}>
                    Vehicle
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: 128 }]}>
                    Time
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: 80 }]}>
                    Staff
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: 80 }]}>
                    Amount
                  </Text>
                  <Text style={[styles.tableHeaderText, { width: 80 }]}>
                    Payment
                  </Text>
                </View>
                <FlatList
                  data={transactionLogs}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item, index }) => (
                    <Animated.View
                      entering={FadeInDown.duration(400).delay(index * 100)}
                      style={[
                        styles.tableRow,
                        { flexDirection: "row", paddingVertical: 12 },
                      ]}
                    >
                      <Text style={[styles.tableRowText, { width: 80 }]}>
                        {item.id}
                      </Text>
                      <Text style={[styles.tableRowText, { width: 80 }]}>
                        {item.type}
                      </Text>
                      <Text style={[styles.tableRowText, { width: 80 }]}>
                        {item.vehicleType || "N/A"}
                      </Text>
                      <Text style={[styles.tableRowText, { width: 128 }]}>
                        {item.timestamp
                          ? new Date(item.timestamp).toLocaleString()
                          : "N/A"}
                      </Text>
                      <Text style={[styles.tableRowText, { width: 80 }]}>
                        {item.staff || "Unknown"}
                      </Text>
                      <Text style={[styles.tableRowMoney, { width: 80 }]}>
                        ₹{item.amount || 0}
                      </Text>
                      <Text style={[styles.tableRowText, { width: 80 }]}>
                        {item.paymentMethod || "N/A"}
                      </Text>
                    </Animated.View>
                  )}
                />
              </View>
            </ScrollView>
          ) : (
            <Text style={styles.noData}>No transaction logs available</Text>
          )}
        </Animated.View>
      </ScrollView>
    </AccessControl>
  );
};

export default TodayReport;
