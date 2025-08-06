import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";
import { PieChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import userAuthStore from "@/utils/store";
import AccessControl from "@/components/AccessControl";

const screenWidth = Dimensions.get("window").width;

const StaffRevenue = () => {
  const { staffId } = useLocalSearchParams<{ staffId: string }>();
  const { fetchRevenueReport, selectedStaffRevenue, isLoading } =
    userAuthStore();

  const [filterDate, setFilterDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (staffId) {
      fetchRevenueReport(staffId);
    }
  }, [staffId]);

  const dataToDisplay = selectedStaffRevenue || [];

  const filteredData = dataToDisplay?.filter((item: any) => {
    const rawDate = item.entryDateTime || item.date;
    const parsedDate = new Date(rawDate);
    if (!rawDate || isNaN(parsedDate.getTime())) return false;
    return (
      format(parsedDate, "yyyy-MM-dd") === format(filterDate, "yyyy-MM-dd")
    );
  });

  const totalRevenue = filteredData.reduce(
    (sum: number, item: any) => sum + (item.amount || 0),
    0
  );
  const totalTransactions = filteredData.length;

  const paymentMethodData = filteredData.reduce((acc: any, item: any) => {
    const method = item.paymentMethod || "Unknown";
    acc[method] = (acc[method] || 0) + (item.amount || 0);
    return acc;
  }, {});

  const pieColors = [
    "#ffcd01",
    "#f59e0b",
    "#4b5563",
    "#10b981",
    "#3b82f6",
    "#ef4444",
  ];

  const chartData = Object.keys(paymentMethodData).map((method, index) => ({
    name: method,
    amount: paymentMethodData[method],
    color: pieColors[index % pieColors.length],
    legendFontColor: "#000",
    legendFontSize: 12,
  }));

  const renderItem = ({ item }: { item: any }) => {
    const parsedDate = item.date || item.entryDateTime;
    return (
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.boldLabel}>Vehicle:</Text>
          <Text style={styles.cardValue}>{item.vehicleNo || "N/A"}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.cardValue}>{item.name || "N/A"}</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Type / Days:</Text>
          <Text style={styles.cardValue}>
            {item.vehicleType || "N/A"} / {item.paidDays || "N/A"}
          </Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Amount / Method:</Text>
          <Text style={styles.cardValue}>
            ₹{item.amount || 0} / {item.paymentMethod || "N/A"}
          </Text>
        </View>
        <Text style={styles.dateText}>
          Date:{" "}
          {parsedDate ? format(new Date(parsedDate), "MMM dd, yyyy") : "N/A"}
        </Text>
      </View>
    );
  };

  return (
    <AccessControl required="staffRevenue">
      <View style={styles.container}>
        <View style={styles.dateHeader}>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color="#000" />
            <Text style={styles.dateTextBtn}>
              {format(filterDate, "dd/MM/yyyy")}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={filterDate}
            mode="date"
            display="default"
            onChange={(e, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setFilterDate(selectedDate);
            }}
          />
        )}

        {!isLoading && filteredData.length > 0 && (
          <View style={styles.summarySection}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.revenueAmount}>₹{totalRevenue}</Text>
                  <Text style={styles.summaryLabel}>Revenue</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.transactionCount}>
                    {totalTransactions}
                  </Text>
                  <Text style={styles.summaryLabel}>Transactions</Text>
                </View>
              </View>
            </View>

            {chartData.length > 0 && (
              <View style={styles.chartBox}>
                <Text style={styles.chartTitle}>By Payment Method</Text>
                <PieChart
                  data={chartData}
                  width={screenWidth - 32}
                  height={200}
                  accessor="amount"
                  chartConfig={{
                    color: () => "#000",
                    labelColor: () => "#000",
                  }}
                  backgroundColor="transparent"
                  paddingLeft="20"
                  absolute
                />
              </View>
            )}
          </View>
        )}

        {isLoading ? (
          <View style={styles.centeredView}>
            <ActivityIndicator size="large" color="#ffcd01" />
          </View>
        ) : filteredData.length === 0 ? (
          <View style={styles.centeredView}>
            <Text style={styles.noDataText}>
              No data for {format(filterDate, "dd MMM yyyy")}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={(item, index) => item._id || index.toString()}
            contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 16 }}
          />
        )}
      </View>
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  dateHeader: {
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: "flex-end",
  },
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff7cc",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  dateTextBtn: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  summarySection: { padding: 16, gap: 12 },
  summaryCard: {
    backgroundColor: "#f6f6f6",
    borderRadius: 12,
    padding: 16,
    elevation: 3,
  },
  summaryTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  summaryItem: { alignItems: "center" },
  revenueAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffcd01",
  },
  transactionCount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  chartBox: {
    backgroundColor: "#f6f6f6",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  chartTitle: {
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 16,
    color: "#000",
  },
  card: {
    backgroundColor: "#f6f6f6",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
    gap: 6,
  },
  label: { color: "#4b5563", fontSize: 14 },
  boldLabel: { fontWeight: "600", color: "#000", fontSize: 14 },
  cardValue: { color: "#111", fontSize: 14 },
  dateText: {
    fontSize: 12,
    color: "#fff7cc",
    marginTop: 4,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  noDataText: {
    color: "#6b7280",
    fontSize: 14,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default StaffRevenue;
