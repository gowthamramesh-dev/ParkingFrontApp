import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Toast from "react-native-toast-message";
import userAuthStore from "@/utils/store";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const AllStaffs = () => {
  const { getAllStaffs, staffs, isLoading } = userAuthStore();
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
      onPress={() =>
        router.push({
          pathname: "/listPage",
          params: {
            staffId: item._id,
            username: item.username,
          },
        })
      }
    >
      <View style={styles.cardContent}>
        <Text style={styles.staffName}>👤 {item.username}</Text>
        <Text style={styles.buildingInfo}>
          Building: {item.building?.name || "N/A"}{" "}
          {item.building?.location ? `(${item.building.location})` : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
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
        <ActivityIndicator size="large" color="#4F46E5" />
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937", // Tailwind gray-800
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  staffName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  buildingInfo: {
    fontSize: 14,
    color: "#6B7280", // Tailwind gray-600
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280", // Tailwind gray-500
    fontSize: 16,
  },
});

export default AllStaffs;
