import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Toast from "react-native-toast-message";
import userAuthStore from "@/utils/store";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AccessControl from "@/components/AccessControl";

const AllStaffs = () => {
  const { getAllStaffs, staffs, isLoading, getStaffPermission } =
    userAuthStore();
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    const res = await getAllStaffs();
    if (!res.success) {
      Toast.show({
        type: "error",
        text1: "Failed to fetch staff list",
        text2: res.error || "",
        position: "top",
      });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        getStaffPermission(item._id);
        router.push({
          pathname: "/listPage",
          params: {
            staffId: item._id,
            username: item.username,
          },
        });
      }}
    >
      <View style={styles.cardContent}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="person-circle" size={28} color="#FFCD01" />
          <Text style={styles.staffName}>{item.username}</Text>
        </View>
        <Text style={styles.buildingInfo}>
          {item.building?.name || "N/A"}{" "}
          {item.building?.location ? `(${item.building.location})` : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <AccessControl required="ViewStaff">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerBox}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.push("/(protected)/(tabs)/staffPage")}
            >
              <Ionicons name="arrow-back" size={26} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Staff Lists</Text>
            <View style={{ width: 26 }} />
          </View>
        </View>

        {/* Loader / List */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#ffcd01" />
        ) : staffs.length === 0 ? (
          <Text style={styles.emptyText}>No staff found</Text>
        ) : (
          <FlatList
            data={staffs}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
          />
        )}

        <Toast />
      </View>
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  headerBox: {
    backgroundColor: "#f6f6f6",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  card: {
    backgroundColor: "#FFF8C4",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  buildingInfo: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
    marginTop: 40,
  },
});

export default AllStaffs;
