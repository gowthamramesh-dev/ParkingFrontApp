import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownPicker from "react-native-dropdown-picker";
import useAuthStore from "../utils/store";
import ToastManager, { Toast } from "toastify-react-native";
import { RFValue } from "react-native-responsive-fontsize";

const vehicleTypes = ["cycle", "bike", "car", "van", "lorry", "bus"];

const CheckIn = () => {
  const [name, setName] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [vehicleType, setVehicleType] = useState("cycle");
  const [mobile, setMobile] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isLoading, setIsLoading] = useState(false);
  const [days, setDays] = useState("1");
  const [amount, setAmount] = useState(0);

  const [vehicleTypeOpen, setVehicleTypeOpen] = useState(false);
  const [daysOpen, setDaysOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const { checkIn, fetchPrices, priceData } = useAuthStore();

  useEffect(() => {
    const loadPrices = async () => {
      const token = await AsyncStorage.getItem("token");
      const user = JSON.parse((await AsyncStorage.getItem("user")) || "{}");
      if (token && user?._id) {
        await fetchPrices(user._id, token);
      }
    };
    loadPrices();
  }, [fetchPrices]);

  useEffect(() => {
    const rate = Number(priceData?.dailyPrices?.[vehicleType] || 0);
    setAmount(rate * Number(days));
  }, [vehicleType, days, priceData]);

  const clearForm = () => {
    setName("");
    setVehicleNo("");
    setVehicleType("cycle");
    setMobile("");
    setPaymentMethod("cash");
    setDays("1");
    setAmount(0);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!vehicleNo || !mobile) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Vehicle number and mobile are required",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
      setIsLoading(false);
      return;
    }

    if (!amount) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not determine amount. Please check prices.",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
      setIsLoading(false);
      return;
    }

    const result = await checkIn(
      name,
      vehicleNo,
      vehicleType,
      mobile,
      paymentMethod,
      Number(days),
      amount
    );

    setIsLoading(false);

    if (!result.success) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: result.error || "Check In Failed",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "Check In Success",
      text2: "Vehicle Checked In",
      position: "top",
      visibilityTime: 2000,
      autoHide: true,
    });

    clearForm();
  };

  const handleOpen = useCallback((dropdown, open) => {
    setVehicleTypeOpen(dropdown === "vehicle" && open);
    setDaysOpen(dropdown === "days" && open);
    setPaymentOpen(dropdown === "payment" && open);
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <View style={styles.container}>
          <Text style={styles.title}>Check In</Text>
          <View style={styles.formContainer}>
            <TextInput
              placeholder="Name"
              value={name}
              placeholderTextColor="#888"
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Vehicle Number"
              value={vehicleNo}
              placeholderTextColor="#888"
              onChangeText={setVehicleNo}
              onBlur={() => setVehicleNo(vehicleNo.toUpperCase())}
              autoCapitalize="characters"
              style={styles.input}
            />

            <DropDownPicker
              textStyle={{ color: "#000" }}
              labelStyle={{ color: "#000" }}
              open={vehicleTypeOpen}
              value={vehicleType}
              items={vehicleTypes.map((type) => ({
                label: type.charAt(0).toUpperCase() + type.slice(1),
                value: type,
              }))}
              setOpen={(open) => handleOpen("vehicle", open)}
              setValue={setVehicleType}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownList}
              textStyle={{ fontSize: RFValue(14) }}
              placeholder="Select Vehicle Type"
              zIndex={3000}
              zIndexInverse={1000}
            />

            <TextInput
              placeholder="Mobile Number"
              maxLength={10}
              value={mobile}
              placeholderTextColor="#888"
              onChangeText={setMobile}
              keyboardType="number-pad"
              style={styles.input}
            />

            <DropDownPicker
              textStyle={{ color: "#000" }}
              labelStyle={{ color: "#000" }}
              open={daysOpen}
              value={days}
              items={[...Array(7)].map((_, i) => ({
                label: `${i + 1} Day${i > 0 ? "s" : ""}`,
                value: `${i + 1}`,
              }))}
              setOpen={(open) => handleOpen("days", open)}
              setValue={setDays}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownList}
              textStyle={{ fontSize: RFValue(14) }}
              placeholder="Select Days"
              zIndex={2000}
              zIndexInverse={900}
            />

            <DropDownPicker
              textStyle={{ color: "#000" }}
              labelStyle={{ color: "#000" }}
              open={paymentOpen}
              value={paymentMethod}
              items={[
                { label: "Cash", value: "cash" },
                { label: "GPay", value: "gpay" },
                { label: "PhonePe", value: "phonepe" },
                { label: "Paytm", value: "paytm" },
              ]}
              setOpen={(open) => handleOpen("payment", open)}
              setValue={setPaymentMethod}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownList}
              textStyle={{ fontSize: RFValue(14) }}
              placeholder="Select Payment Method"
              zIndex={1000}
              zIndexInverse={800}
            />

            <View style={styles.amountContainer}>
              <Text style={styles.amountText}>Amount: ₹{amount}</Text>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#10B981" />
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Enter</Text>
              )}
            </TouchableOpacity>
          </View>
          <ToastManager showCloseIcon={false} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    padding: 16,
    gap: 20,
    zIndex: 4000,
    flex: 1,
  },
  title: {
    fontSize: RFValue(18),
    fontWeight: "bold",
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    padding: 16,
    gap: 12,
    zIndex: 4000,
  },
  input: {
    height: 48,
    width: "100%",
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ebf8ff",
    fontSize: RFValue(14),
  },
  dropdown: {
    height: 48,
    backgroundColor: "#ebf8ff",
    borderColor: "#e5e7eb",
  },
  dropdownList: {
    backgroundColor: "#ebf8ff",
    borderColor: "#e5e7eb",
  },
  amountContainer: {
    alignItems: "center",
  },
  amountText: {
    fontSize: RFValue(16),
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#4ade80",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    textAlign: "center",
    fontSize: RFValue(16),
    color: "#ffffff",
    fontWeight: "600",
  },
  loadingContainer: {
    backgroundColor: "#ffffff",
    padding: 4,
    borderRadius: 50,
  },
});

export default CheckIn;
