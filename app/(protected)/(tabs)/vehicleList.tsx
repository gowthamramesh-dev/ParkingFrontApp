import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TextInput,
  Platform,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as Clipboard from "expo-clipboard";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useNavigation } from "@react-navigation/native";
import userAuthStore from "@/utils/store";
import { Toast } from "toastify-react-native";

type Vehicle = {
  name: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const CheckinCard = ({ item }: any) => {
  const formattedDate = format(
    new Date(item.entryDateTime),
    "MMM d, yyyy - h:mm a"
  );

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.nameStatusContainer}>
          <Text style={styles.vehicleName}>{item.name}</Text>
          <Text
            style={[
              styles.status,
              item.isCheckedOut ? styles.statusOut : styles.statusActive,
            ]}
          >
            {item.isCheckedOut ? "Checked Out" : "Active"}
          </Text>
        </View>
        <View style={styles.vehicleNoContainer}>
          <Text style={styles.vehicleNo}>{item.vehicleNo}</Text>
          <TouchableOpacity
            onPress={() => {
              Clipboard.setStringAsync(item.tokenId);
              Toast.show({
                type: "success",
                text1: "Copied!",
                text2: ` Token Id copied to clipboard.`,
              });
            }}
          >
            <Text style={styles.tokenCopy}>
              <Ionicons name="copy-outline" size={12} /> Token
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.rowBetween}>
          <Text style={styles.grayText}>{item.vehicleType}</Text>
          <Text style={styles.grayText}>{formattedDate}</Text>
        </View>
        <View style={styles.detailRowGroup}>
          <View style={styles.rowBetween}>
            <Text style={styles.grayText}>Paid Days</Text>
            <Text style={styles.boldText}>{item.paidDays}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.grayText}>Rate</Text>
            <Text style={styles.boldText}>
              ₹{(+item.perDayRate / +item.paidDays).toFixed(2)}/day
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.grayText}>Total Paid</Text>
            <Text style={styles.greenText}>₹{item.amount}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const VehicleList = () => {
  const navigation = useNavigation<any>();

  const Vehicles: Vehicle[] = [
    { name: "All", value: "all", icon: "list-outline" },
    { name: "Cycle", value: "cycle", icon: "bicycle-outline" },
    { name: "Bike", value: "bike", icon: "car-sport-outline" },
    { name: "Car", value: "car", icon: "car-outline" },
    { name: "Van", value: "van", icon: "bus-outline" },
    { name: "Bus", value: "bus", icon: "bus-outline" },
  ];

  const [checkType, setCheckType] = useState("checkins");
  const { vehicleList, VehicleListData } = userAuthStore();
  const [selected, setSelected] = useState("all");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleList = async (vehicle: string, type = checkType) => {
    setLoading(true);
    const result = await vehicleList(vehicle, type);
    if (!result.success) Toast.error("Error in API");
    setLoading(false);
  };

  useEffect(() => {
    handleList("all");
  }, []);
  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", () => {
      handleList("all");
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    handleList(selected, checkType);
  }, [checkType]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={24} />
        <TextInput
          placeholder="Search vehicle"
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.vehicleFilterBox}>
        <View style={styles.centeredTextBox}>
          <Text style={styles.vehicleTitle}>Vehicles</Text>
        </View>

        <FlatList
          data={Vehicles}
          horizontal
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => {
            const isSelected = selected === item.value;
            return (
              <TouchableOpacity
                style={[
                  styles.vehicleType,
                  { backgroundColor: isSelected ? "#059669" : "#4ade80" },
                ]}
                onPress={() => {
                  setSelected(item.value);
                  handleList(item.value);
                }}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={isSelected ? "#fff" : "#000"}
                />
                <Text style={{ color: isSelected ? "#fff" : "#000" }}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View style={styles.rowFilter}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={checkType}
            onValueChange={setCheckType}
            style={{ height: 50, backgroundColor: "transparent" }}
          >
            <Picker.Item color="#000" label="Check In" value="checkins" />
            <Picker.Item color="#000" label="Check Out" value="checkouts" />
          </Picker>
        </View>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.dateBtn}
        >
          <Text style={styles.dateBtnText}>
            {filterDate ? format(filterDate, "MMM dd, yyyy") : "Pick Date"}
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

      <View style={styles.resultContainer}>
        {loading ? (
          <View style={styles.centeredContent}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.grayText}>Loading Vehicles...</Text>
          </View>
        ) : VehicleListData && VehicleListData.length > 0 ? (
          <FlatList
            data={Array.from(VehicleListData).filter((item) => {
              const matchesSearch =
                item.vehicleNo.toLowerCase().includes(search.toLowerCase()) ||
                item.name.toLowerCase().includes(search.toLowerCase());

              const matchesDate = filterDate
                ? format(new Date(item.entryDateTime), "yyyy-MM-dd") ===
                  format(filterDate, "yyyy-MM-dd")
                : true;

              return matchesSearch && matchesDate;
            })}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <CheckinCard item={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 12 }}
          />
        ) : (
          <View style={styles.centeredContent}>
            <Text style={styles.grayText}>No vehicle data found</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16,
    gap: 12,
    marginBottom: 60,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  searchInput: { flex: 1, fontSize: 16, height: 48, paddingLeft: 8 },
  vehicleFilterBox: {
    backgroundColor: "white",
    alignItems: "center",
    borderRadius: 4,
    padding: 8,
  },
  centeredTextBox: { alignItems: "center", marginBottom: 8 },
  vehicleTitle: { fontSize: 20, fontWeight: "500" },
  vehicleType: {
    marginHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rowFilter: { flexDirection: "row", alignItems: "center", gap: 8 },
  pickerWrapper: {
    flex: 1,
    height: 60,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  dateBtn: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    elevation: 1,
  },
  dateBtnText: { fontSize: 14 },
  resultContainer: { flex: 1, backgroundColor: "white" },
  centeredContent: { flex: 1, justifyContent: "center", alignItems: "center" },
  grayText: { color: "#6b7280", fontSize: 14, marginTop: 8 },
  cardContainer: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameStatusContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  vehicleName: { fontSize: 18, fontWeight: "600", color: "#111827" },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    borderRadius: 999,
    fontWeight: "600",
  },
  statusOut: { backgroundColor: "#fee2e2", color: "#b91c1c" },
  statusActive: { backgroundColor: "#d1fae5", color: "#047857" },
  vehicleNoContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
  vehicleNo: { fontSize: 16, color: "#6b7280" },
  tokenCopy: { fontSize: 12, color: "#10b981" },
  detailsContainer: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailRowGroup: { marginTop: 4, gap: 4 },
  boldText: { fontWeight: "500", color: "#1f2937" },
  greenText: { fontWeight: "600", color: "#059669" },
});

export default VehicleList;
