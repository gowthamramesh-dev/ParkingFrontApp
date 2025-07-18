import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import userAuthStore from "@/utils/store";

const screenWidth = Dimensions.get("window").width;

const StaffRevenue = () => {
  const { staffId } = useLocalSearchParams<{ staffId: string }>();
  const { fetchRevenueReport, selectedStaffRevenue, isLoading } =
    userAuthStore();

  const [search, setSearch] = useState("");
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

    const matchesSearch =
      item.vehicleNo?.toLowerCase().includes(search.toLowerCase()) ||
      item.name?.toLowerCase().includes(search.toLowerCase());

    const matchesDate =
      format(parsedDate, "yyyy-MM-dd") === format(filterDate, "yyyy-MM-dd");

    return matchesSearch && matchesDate;
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

  const chartData = Object.keys(paymentMethodData).map((method, index) => ({
    name: method,
    amount: paymentMethodData[method],
    color: `hsl(${index * 60}, 70%, 50%)`,
    legendFontColor: "#000000",
    legendFontSize: 12,
  }));

  const renderItem = ({ item }: { item: any }) => {
    const rawDate = item.date || item.entryDateTime;
    const parsedDate =
      rawDate && !isNaN(new Date(rawDate).getTime())
        ? format(new Date(rawDate), "MMM dd, yyyy")
        : "N/A";

    return (
      <View style={styles.card}>
        <Text style={styles.vehicleNo}>
          Vehicle No: {item.vehicleNo || "N/A"}
        </Text>
        <Text style={styles.detailText}>Name: {item.name || "N/A"}</Text>
        <Text style={styles.detailText}>
          Type: {item.vehicleType || "N/A"} | Paid Days:{" "}
          {item.paidDays || "N/A"}
        </Text>
        <Text style={styles.detailText}>
          Amount: ₹{item.amount || 0} | Method: {item.paymentMethod || "N/A"}
        </Text>
        <Text style={styles.dateText}>Date: {parsedDate}</Text>
      </View>
    );
  };

  if (!staffId) {
    return (
      <View style={styles.centeredView}>
        <Text style={styles.errorText}>Error: Staff ID not provided</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and Date Filter */}
      <View style={styles.dateFilterRow}>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.dateButton}
        >
          <Ionicons name="calendar" size={18} color="#ffffff" />
          <Text style={styles.dateButtonText}>
            {filterDate ? format(filterDate, "dd/MM/yyyy") : "Pick Date"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <View style={styles.datePickerBox}>
          <Text style={styles.datePickerTitle}>Select a Date</Text>
          <DateTimePicker
            value={filterDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setFilterDate(selectedDate);
              }
            }}
          />
        </View>
      )}

      {/* Summary and Chart */}
      {!isLoading && filteredData.length > 0 && (
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Revenue Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.revenueText}>₹{totalRevenue}</Text>
                <Text style={styles.summaryLabel}>Total Revenue</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.transactionText}>{totalTransactions}</Text>
                <Text style={styles.summaryLabel}>Transactions</Text>
              </View>
            </View>
          </View>

          {chartData.length > 0 && (
            <View style={styles.chartBox}>
              <Text style={styles.chartTitle}>Revenue by Payment Method</Text>
              <PieChart
                data={chartData}
                width={screenWidth - 40}
                height={240}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: () => `#000000`,
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          )}
        </View>
      )}

      {/* Revenue List */}
      {isLoading ? (
        <View style={styles.centeredView}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : filteredData?.length === 0 ? (
        <View style={styles.centeredView}>
          <Text style={styles.noDataText}>
            No data found for {format(filterDate, "MMM dd, yyyy")}.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => `${item._id || index}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#DC2626",
    fontWeight: "500",
  },
  dateFilterRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 3,
  },
  dateButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 8,
  },
  datePickerBox: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  datePickerTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  summarySection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#111827",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  summaryItem: {
    alignItems: "center",
  },
  revenueText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#16A34A",
  },
  transactionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2563EB",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  chartBox: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#1F2937",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  vehicleNo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  detailText: {
    fontSize: 16,
    color: "#4B5563",
    marginTop: 2,
  },
  dateText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },
  noDataText: {
    fontSize: 16,
    color: "#6B7280",
  },
});

export default StaffRevenue;
