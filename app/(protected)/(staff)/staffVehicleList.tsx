import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  Alert,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";

import userAuthStore from "@/utils/store";

// ✅ Valid Icons
const VALID_IONICONS = new Set([
  "list-outline",
  "bicycle-outline",
  "car-sport-outline",
  "car-outline",
  "bus-outline",
  "alert-circle-outline",
]);

const SafeIonicon = ({ name, size = 22, color = "#000" }) => {
  const isValid = VALID_IONICONS.has(name);
  if (!isValid) {
    console.warn(⚠ Invalid Ionicon: ${name});
  }
  return (
    <Ionicons
      name={isValid ? name : "alert-circle-outline"}
      size={size}
      color={color}
    />
  );
};

const Vehicles = [
  { name: "All", value: "all", icon: "list-outline" },
  { name: "Cycle", value: "cycle", icon: "bicycle-outline" },
  { name: "Bike", value: "bike", icon: "car-sport-outline" },
  { name: "Car", value: "car", icon: "car-outline" },
  { name: "Van", value: "van", icon: "bus-outline" },
  { name: "Bus", value: "bus", icon: "bus-outline" },
];

// ✅ CheckinCard
const CheckinCard = ({ item }: any) => {
  const formattedDate = format(
    new Date(item.entryDateTime),
    "MMM d, yyyy - h:mm a"
  );

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={styles.row}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text
            style={[
              styles.statusText,
              item.isCheckedOut ? styles.checkedOut : styles.active,
            ]}
          >
            {item.isCheckedOut ? "Checked Out" : "Active"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.vehicleNo}>{item.vehicleNo}</Text>
          <TouchableOpacity
            onPress={() => {
              Clipboard.setStringAsync(item.tokenId);
              Alert.alert("Copied!", ${item.tokenId} copied to clipboard);
            }}
          >
            <Text style={styles.tokenCopy}>
              <Ionicons name="copy-outline" size={12} /> Token
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardInfoBox}>
        <View style={styles.rowBetween}>
          <Text style={styles.vehicleType}>{item.vehicleType}</Text>
          <Text style={styles.entryDate}>{formattedDate}</Text>
        </View>
        <View style={{ marginTop: 4 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Paid Days</Text>
            <Text style={styles.value}>{item.paidDays}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Rate</Text>
            <Text style={styles.value}>
              ₹
              {isNaN(Number(item.perDayRate)) ||
              isNaN(Number(item.paidDays)) ||
              Number(item.paidDays) === 0
                ? "0.00"
                : (Number(item.perDayRate) / Number(item.paidDays)).toFixed(2)}
              /day
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Total Paid</Text>
            <Text style={styles.total}>₹{item.amount}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// ✅ Main Screen
const VehicleScreen = () => {
  const { staffId } = useLocalSearchParams();
  const isFocused = useIsFocused();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("all");
  const [checkType, setCheckType] = useState("checkins");
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    isLoading,
    VehicleListData,
    checkins,
    checkouts,
    fetchCheckins,
    fetchCheckouts,
    vehicleList,
  } = userAuthStore((state) => state);

  const handleList = async (type: string) => {
    if (checkType === "checkins") {
      await fetchCheckins(type, staffId as string);
    } else if (checkType === "checkouts") {
      await fetchCheckouts(type, staffId as string);
    } else {
      await vehicleList(type, "vehicleList", staffId as string);
    }
  };

  useEffect(() => {
    if (isFocused) {
      handleList(selected);
    }
  }, [isFocused, checkType, selected]);

  const getDataToShow = () => {
    if (checkType === "checkins") return Array.isArray(checkins) ? checkins : [];
    if (checkType === "checkouts") return Array.isArray(checkouts) ? checkouts : [];
    return Array.isArray(VehicleListData) ? VehicleListData : [];
  };

  const dataToDisplay = getDataToShow();

  const filteredData = dataToDisplay?.filter((item: any) => {
    const matchesSearch =
      item.vehicleNo?.toLowerCase().includes(search.toLowerCase()) ||
      item.name?.toLowerCase().includes(search.toLowerCase());

    const matchesDate = filterDate
      ? format(new Date(item.entryDateTime), "yyyy-MM-dd") ===
        format(filterDate, "yyyy-MM-dd")
      : true;

    return matchesSearch && matchesDate;
  });

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={{ marginTop: 8, color: "#6B7280" }}>
            Loading Vehicles...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <CheckinCard item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListHeaderComponent={
            <View style={{ paddingHorizontal: 16, paddingVertical: 16, gap: 12 }}>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={24} />
                <TextInput
                  placeholder="Search vehicle"
                  value={search}
                  onChangeText={setSearch}
                  style={styles.searchInput}
                />
              </View>

              <View style={styles.vehicleFilterContainer}>
                <Text style={styles.vehicleHeading}>Vehicles</Text>
                <FlatList
                  data={Vehicles}
                  horizontal
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => {
                    const isSelected = selected === item.value;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.vehicleButton,
                          isSelected
                            ? styles.selectedVehicle
                            : styles.unselectedVehicle,
                        ]}
                        onPress={() => {
                          setSelected(item.value);
                          handleList(item.value);
                        }}
                      >
                        <SafeIonicon
                          name={item.icon}
                          size={22}
                          color={isSelected ? "#fff" : "#000"}
                        />
                        <Text
                          style={
                            isSelected
                              ? styles.selectedText
                              : styles.unselectedText
                          }
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                  showsHorizontalScrollIndicator={false}
                />
              </View>

              <View style={styles.filterRow}>
                <View style={{ flex: 1 }}>
                  <Picker
                    selectedValue={checkType}
                    onValueChange={(val) => setCheckType(val)}
                  >
                    <Picker.Item label="Check In" value="checkins" />
                    <Picker.Item label="Check Out" value="checkouts" />
                    <Picker.Item label="Vehicle List" value="list" />
                  </Picker>
                </View>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateButton}
                >
                  <Text style={styles.dateButtonText}>
                    {filterDate
                      ? format(filterDate, "MMM dd, yyyy")
                      : "Pick Date"}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={filterDate || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (event.type === "set" && selectedDate) {
                      setFilterDate(selectedDate);
                    }
                  }}
                />
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyText}>No vehicle data found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default VehicleScreen;

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBar: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
    backgroundColor: "white",
    height: 48,
  },
  vehicleFilterContainer: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 6,
    elevation: 2,
    alignItems: "center",
  },
  vehicleHeading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  vehicleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedVehicle: {
    backgroundColor: "#059669",
  },
  unselectedVehicle: {
    backgroundColor: "#4ade80",
  },
  selectedText: {
    color: "#fff",
    fontSize: 14,
  },
  unselectedText: {
    color: "#000",
    fontSize: 14,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateButton: {
    backgroundColor: "#DBEAFE",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    elevation: 1,
  },
  dateButtonText: {
    color: "#1D4ED8",
    fontSize: 14,
  },
  emptyTextContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginRight: 6,
  },
  statusText: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "600",
  },
  checkedOut: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
  },
  active: {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
  },
  vehicleNo: {
    fontSize: 12,
    color: "#6B7280",
    marginRight: 6,
  },
  tokenCopy: {
    fontSize: 12,
    color: "#10B981",
  },
  cardInfoBox: {
    backgroundColor: "#F3F4F6",
    marginTop: 6,
    borderRadius: 4,
    padding: 8,
  },
  vehicleType: {
    fontSize: 14,
    color: "#374151",
    textTransform: "capitalize",
  },
  entryDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  label: {
    fontSize: 14,
    color: "#374151",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  total: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
});