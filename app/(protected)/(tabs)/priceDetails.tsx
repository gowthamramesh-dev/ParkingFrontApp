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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import userAuthStore from "@/utils/store";
import ToastManager, { Toast } from "toastify-react-native";
import AccessControl from "@/components/AccessControl";

const vehicleTypes = ["cycle", "bike", "car", "van", "lorry", "bus"];

const PriceDetails = () => {
  const {
    fetchPrices,
    addDailyPrices,
    addMonthlyPrices,
    updateDailyPrices,
    updateMonthlyPrices,
    priceData,
  } = userAuthStore();

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

  const handleAdd = async () => {
    const token = await AsyncStorage.getItem("token");
    const user = JSON.parse(await AsyncStorage.getItem("user"));
    if (!token || !user) return;
    try {
      activeTab === "daily"
        ? await addDailyPrices(user._id, dailyForm, token)
        : await addMonthlyPrices(user._id, monthlyForm, token);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: `${activeTab} prices added successfully.`,
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
    }
  };

  const handleUpdate = async () => {
    const token = await AsyncStorage.getItem("token");
    const user = JSON.parse(await AsyncStorage.getItem("user"));
    if (!token || !user) return;
    try {
      activeTab === "daily"
        ? await updateDailyPrices(user._id, dailyForm, token)
        : await updateMonthlyPrices(user._id, monthlyForm, token);
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
              <Text style={styles.headerTitle}>Manage Price List</Text>
              <View style={styles.headerSpacer} />
            </View>
          </View>

          <ScrollView style={{ marginBottom: 60 }}>
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "daily" ? styles.activeTab : styles.inactiveTab,
                ]}
                onPress={() => setActiveTab("daily")}
              >
                <Text
                  style={
                    activeTab === "daily"
                      ? styles.activeTabText
                      : styles.inactiveTabText
                  }
                >
                  Daily Prices
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "monthly"
                    ? styles.activeTab
                    : styles.inactiveTab,
                ]}
                onPress={() => setActiveTab("monthly")}
              >
                <Text
                  style={
                    activeTab === "monthly"
                      ? styles.activeTabText
                      : styles.inactiveTabText
                  }
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
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  !isFormValid(activeTab) && styles.disabledButton,
                ]}
                onPress={handleAdd}
                disabled={!isFormValid(activeTab)}
              >
                <Text style={styles.buttonText}>Add Price</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  !isFormValid(activeTab) && styles.disabledButton,
                ]}
                onPress={handleUpdate}
                disabled={!isFormValid(activeTab)}
              >
                <Text style={styles.buttonText}>Update Price</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
        <ToastManager showCloseIcon={false} />
      </KeyboardAvoidingView>
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  innerContainer: { padding: 16, flex: 1 },
  headerBox: {
    marginVertical: 16,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  headerSpacer: { width: 48 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  tabRow: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 4,
    overflow: "hidden",
  },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: "center" },
  activeTab: { backgroundColor: "#16a34a" },
  inactiveTab: { backgroundColor: "white" },
  activeTabText: { color: "white", fontWeight: "700", fontSize: 16 },
  inactiveTabText: { color: "#065f46", fontWeight: "700", fontSize: 16 },
  formBox: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    elevation: 1,
  },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  inputField: {
    backgroundColor: "#DBEAFE",
    borderRadius: 4,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginVertical: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  disabledButton: { opacity: 0.5 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});

export default PriceDetails;
