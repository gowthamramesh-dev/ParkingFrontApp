import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import userAuthStore from "@/utils/store";
import ToastManager, { Toast } from "toastify-react-native";
import AccessControl from "@/components/AccessControl";

const vehicleTypes = ["cycle", "bike", "car", "van", "lorry", "bus"];

const PriceDetails = () => {
  const { fetchPrices, updateDailyPrices, updateMonthlyPrices, priceData } =
    userAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const [dailyForm, setDailyForm] = useState({
    cycle: "",
    bike: "",
    car: "",
    van: "",
    lorry: "",
    bus: "",
  });
  const [monthlyForm, setMonthlyForm] = useState({
    cycle: "",
    bike: "",
    car: "",
    van: "",
    lorry: "",
    bus: "",
  });
  const [activeTab, setActiveTab] = useState("daily");

  useEffect(() => {
    const loadPrices = async () => {
      const token = await AsyncStorage.getItem("token");
      const user = JSON.parse(await AsyncStorage.getItem("user"));
      if (!token || !user) return;
      await fetchPrices(user._id, token);
    };
    loadPrices();
  }, []);

  useEffect(() => {
    if (priceData?.dailyPrices)
      setDailyForm({ ...dailyForm, ...priceData.dailyPrices });
    if (priceData?.monthlyPrices)
      setMonthlyForm({ ...monthlyForm, ...priceData.monthlyPrices });
  }, [priceData]);

  const handleChange = (type, value, mode) => {
    if (mode === "daily") setDailyForm((prev) => ({ ...prev, [type]: value }));
    else setMonthlyForm((prev) => ({ ...prev, [type]: value }));
  };

  const isFormValid = (mode) => {
    const form = mode === "daily" ? dailyForm : monthlyForm;
    return vehicleTypes.every((type) => form[type].trim() !== "");
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    const token = await AsyncStorage.getItem("token");
    const user = JSON.parse(await AsyncStorage.getItem("user"));
    if (!token || !user) return;
    try {
      // eslint-disable-next-line no-unused-expressions
      activeTab === "daily"
        ? await updateDailyPrices(user.id, dailyForm, token)
        : await updateMonthlyPrices(user.id, monthlyForm, token);
      setIsLoading(false);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: `${activeTab} prices updated successfully.`,
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: String(err),
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
      setIsLoading(false);
    }
  };

  return (
    <AccessControl required="priceDetails">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.innerContainer}>
          <View style={styles.headerBox}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={() => router.push("/(protected)/(tabs)/profile")}
              >
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Manage Prices</Text>
              <View style={{ width: 24 }} />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 140, marginHorizontal: 10 }}
            showsVerticalScrollIndicator={false}
          >
            {/* TOGGLE SECTION */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  activeTab === "daily"
                    ? styles.activeToggle
                    : styles.inactiveToggle,
                ]}
                onPress={() => setActiveTab("daily")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    activeTab === "daily"
                      ? styles.activeText
                      : styles.inactiveText,
                  ]}
                >
                  Daily Prices
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  activeTab === "monthly"
                    ? styles.activeToggle
                    : styles.inactiveToggle,
                ]}
                onPress={() => setActiveTab("monthly")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    activeTab === "monthly"
                      ? styles.activeText
                      : styles.inactiveText,
                  ]}
                >
                  Monthly Prices
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formBox}>
              {vehicleTypes.map((type) => (
                <View key={type} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{type}</Text>
                  <TextInput
                    value={
                      activeTab === "daily"
                        ? dailyForm[type]
                        : monthlyForm[type]
                    }
                    onChangeText={(val) => handleChange(type, val, activeTab)}
                    placeholder={`Enter ${type} ${activeTab} price`}
                    keyboardType="numeric"
                    style={styles.inputField}
                  />
                </View>
              ))}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    !isFormValid(activeTab) && styles.disabledButton,
                  ]}
                  onPress={handleUpdate}
                  disabled={!isFormValid(activeTab)}
                >
                  {isLoading ? (
                    <View style={styles.loader}>
                      <ActivityIndicator size="small" color="#ffcd01" />
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Update Price</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
        <ToastManager showCloseIcon={false} />
      </KeyboardAvoidingView>
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff" },
  innerContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  headerBox: {
    marginBottom: 16,
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
  headerTitle: {
    width: 24,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
    color: "#1f2937",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 999,
    padding: 4,
    marginTop: 10,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  activeToggle: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  inactiveToggle: {
    backgroundColor: "#ffffff",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  activeText: {
    color: "#505050",
  },
  inactiveText: {
    color: "#6B7280",
  },

  formBox: {
    backgroundColor: "#f6f6f6",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  inputGroup: { marginBottom: 10 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  inputField: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#111",
    borderWidth: 1,
    borderColor: "#ffec8b",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginVertical: 14,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#ffcd01",
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: "#ffe87b",
  },
  buttonText: { color: "#000", fontSize: 16, fontWeight: "700" },
  loader: {
    backgroundColor: "#fff",
    padding: 2,
    borderRadius: 50,
  },
});

export default PriceDetails;
