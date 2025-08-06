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
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { useNavigation } from "@react-navigation/native";
import userAuthStore from "@/utils/store";
import { Toast } from "toastify-react-native";
import DropDownPicker from "react-native-dropdown-picker";
import AccessControl from "@/components/AccessControl";
import { useLocalSearchParams } from "expo-router";

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
    <View style={styles.cardWrapper}>
      <View style={styles.cardHeader}>
        <View style={styles.headerRow}>
          <Text style={styles.nameText}>{item.name}</Text>
          <Text
            style={[
              styles.statusPill,
              !item.isCheckedOut ? styles.active : styles.out,
            ]}
          >
            {item.isCheckedOut ? "Checked Out" : "Active"}
          </Text>
        </View>
        <View style={styles.vehicleRow}>
          <Text style={styles.vehiclePill}>{item.vehicleNo}</Text>
          <TouchableOpacity
            onPress={() => {
              Clipboard.setStringAsync(item.tokenId);
              Toast.show({
                type: "success",
                text1: "Copied",
                text2: "Token copied to clipboard",
                visibilityTime: 1000,
                position: "top",
              });
            }}
          >
            <Ionicons name="copy-outline" size={14} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.subHeaderRow}>
        <Text style={styles.subLabel}>{item.vehicleType}</Text>
        <Text style={styles.subLabel}>{formattedDate}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Paid Days</Text>
        <Text style={styles.value}>{item.paidDays}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Rate</Text>
        <Text style={styles.value}>
          ₹{(+item.perDayRate / +item.paidDays).toFixed(2)}/Day
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={[styles.label, { fontWeight: 500, color: "black" }]}>
          Total Paid
        </Text>
        <Text style={styles.amountPill}>₹{item.amount}</Text>
      </View>
    </View>
  );
};

const VehicleList = () => {
  const { staffId } = useLocalSearchParams();
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
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: "Check In", value: "checkins" },
    { label: "Check Out", value: "checkouts" },
  ]);

  const { vehicleList, VehicleListData } = userAuthStore();
  const [selected, setSelected] = useState("all");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [close, setClose] = useState(false);

  const handleList = async (vehicle: string, type = checkType) => {
    setLoading(true);
    const result = await vehicleList(vehicle, type, staffId);
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
    <AccessControl required="vehicles">
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
          <View>
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
                      {
                        backgroundColor: isSelected ? "white" : "#ffcd01",
                        borderWidth: 1,
                        borderColor: "#ffcd01",
                      },
                    ]}
                    onPress={() => {
                      setSelected(item.value);
                      handleList(item.value);
                    }}
                  >
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={isSelected ? "#ffcd01" : "#000"}
                    />
                    <Text style={{ color: isSelected ? "#ffcd01" : "#000" }}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              showsHorizontalScrollIndicator={false}
            />
          </View>

          <View style={{ zIndex: 1000, marginBottom: 10 }}>
            <View style={styles.rowFilter}>
              <View style={styles.pickerWrapper}>
                <DropDownPicker
                  textStyle={{ color: "#000" }}
                  labelStyle={{ color: "#000" }}
                  open={open}
                  value={checkType}
                  items={items}
                  setOpen={setOpen}
                  setValue={setCheckType}
                  setItems={setItems}
                  style={{
                    backgroundColor: "#ffcd01",
                    borderColor: "#ffcd01",
                    height: 48,
                    elevation: 2,
                  }}
                  dropDownContainerStyle={{
                    backgroundColor: "#ffcd01",
                    borderColor: "#ffcd01",
                  }}
                  placeholder="Select Type"
                  zIndex={1000}
                  zIndexInverse={3000}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginLeft: 8,
                }}
              >
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateBtn}
                >
                  <Text style={styles.dateBtnText}>
                    {filterDate
                      ? format(filterDate, "MMM dd, yyyy")
                      : "Pick Date"}
                  </Text>
                </TouchableOpacity>
                {close && (
                  <TouchableOpacity
                    onPress={() => {
                      setFilterDate(null);
                      setClose(false);
                    }}
                    style={{}}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color="black"
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
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
                setClose(true);
              }
            }}
          />
        )}

        <View style={styles.resultContainer}>
          {loading ? (
            <View style={styles.centeredContent}>
              <ActivityIndicator size="large" color="#ffcd01" />
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
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  cardWrapper: {
    backgroundColor: "#f6f6f6",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    gap: 6,
    alignContent: "center",
    alignItems: "center",
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  statusPill: {
    fontSize: 10,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
  },
  active: {
    backgroundColor: "#ffe57c",
    color: "#000",
  },
  out: {
    backgroundColor: "#ffe57c",
    color: "#000",
  },
  vehicleRow: {
    flexDirection: "row",
    gap: 5,
    backgroundColor: "#ffcd01",
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: "500",
    fontSize: 12,
    alignItems: "center",
  },
  vehiclePill: {},
  subHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "#6b7280",
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  amountPill: {
    backgroundColor: "#ffe57c",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: "600",
    fontSize: 14,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f6f6",
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  searchInput: { flex: 1, fontSize: 16, height: 48, paddingLeft: 8 },
  vehicleFilterBox: {
    backgroundColor: "#f6f6f6",
    gap: 20,
    borderRadius: 12,
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
  },
  dateBtn: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    elevation: 2,
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
    gap: 4,
    alignItems: "center",
  },
  vehicleName: { fontSize: 18, fontWeight: "600", color: "#111827" },
  status: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 10,
    borderRadius: 999,
    fontWeight: "600",
  },
  statusOut: { backgroundColor: "#fee2e2", color: "#b91c1c" },
  statusActive: { backgroundColor: "#d1fae5", color: "#047857" },
  vehicleNoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  vehicleNo: { fontSize: 14, color: "#6b7280" },
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
