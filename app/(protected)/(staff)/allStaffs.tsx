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

  const renderItem = ({ item }: any) => (
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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="person-circle" size={28} color="#22C55E" />
          <Text style={styles.staffName}> {item.username}</Text>
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
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={28} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Staff Lists</Text>
        </View>

        {/* Loader / List */}
        {isLoading ? (
          <ActivityIndicator size="large" color="lightgreen" />
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
      </SafeAreaView>
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6", // Tailwind gray-100
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    backgroundColor: "white",
    borderRadius: 4,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: "50%",
    marginTop: -14, // To vertically center 28px icon
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937", // Tailwind gray-800
  },
  card: {
    backgroundColor: "#ECFDF5", // Tailwind green-50
    borderColor: "#22C55E", // Tailwind green-500
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#22C55E",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  staffName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#065F46", // Tailwind green-900
  },
  buildingInfo: {
    fontSize: 14,
    color: "#10B981", // Tailwind green-500
  },

  emptyText: {
    textAlign: "center",
    color: "#6B7280", // Tailwind gray-500
    fontSize: 16,
  },
});

export default AllStaffs;
