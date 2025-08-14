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
  Image,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownPicker from "react-native-dropdown-picker";
import useAuthStore from "../utils/store";
import ToastManager, { Toast } from "toastify-react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useNavigation } from "expo-router";

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;
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
  const navigation = useNavigation<any>();
  const loadPrices = async () => {
    const token = await AsyncStorage.getItem("token");
    const user = JSON.parse((await AsyncStorage.getItem("user")) || "{}");
    if (token && user?._id) {
      await fetchPrices(user._id, token);
    }
  };
  useEffect(() => {
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
    setVehicleTypeOpen(false);
    setDaysOpen(false);
    setPaymentOpen(false);
    setIsLoading(false);
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
    if (!(mobile.length === 10)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Mobile must be 10 digits",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
      setIsLoading(false);
      return;
    }
    if (!/^[6-9]/.test(mobile)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Enter a valid mobile number.",
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

  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", () => {
      clearForm();
      loadPrices();
    });
    return unsubscribe;
  }, [navigation]);

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
          <Image
            source={require("../assets/checkInDot.png")}
            style={{
              position: "absolute",
              top: screenHeight * 0.08,
              width: screenWidth * 0.96,
              height: 290,
              opacity: 0.3,
              transform: [
                { translateX: -12 },
                { translateY: -80 },
                { rotate: "10deg" },
              ],
              zIndex: -1,
              resizeMode: "contain",
            }}
          />
          <Image
            source={require("../assets/checkInBike.png")}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: screenWidth * 0.2,
              height: screenHeight * 0.2,
              opacity: 0.3,
              zIndex: -1,
              resizeMode: "contain",
            }}
          />
          <View style={styles.formContainer}>
            <View
              style={{
                alignItems: "flex-start",
                justifyContent: "center",
              }}
            >
              <Text style={styles.title}>Check In</Text>
            </View>
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
              maxLength={10}
              placeholderTextColor="#888"
              onChangeText={setVehicleNo}
              onBlur={() => setVehicleNo(vehicleNo.toUpperCase())}
              autoCapitalize="characters"
              style={styles.input}
            />

            <DropDownPicker
              textStyle={{ color: "#000", fontSize: RFValue(14) }}
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
              textStyle={{ color: "#000", fontSize: RFValue(14) }}
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
              placeholder="Select Days"
              zIndex={2000}
              zIndexInverse={900}
            />

            <DropDownPicker
              textStyle={{ color: "#000", fontSize: RFValue(14) }}
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
              placeholder="Select Payment Method"
              zIndex={1000}
              zIndexInverse={800}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#ffcd01" />
                </View>
              ) : (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={styles.submitButtonText}>Enter</Text>
                  <Text style={styles.submitButtonText}>₹{amount}</Text>
                </View>
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
    paddingBottom: 50,
    gap: 20,
    zIndex: 4000,
    flex: 1,
  },
  title: {
    marginBottom: 10,
    fontSize: RFValue(18),
    fontWeight: "bold",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#f6f6f6",
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  input: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 0,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    fontSize: RFValue(14),
    color: "#111",
  },
  dropdown: {
    height: 48,
    borderRadius: 12,
    borderColor: "transparent",
    backgroundColor: "white",
    elevation: 2,
  },
  dropdownList: {
    borderRadius: 12,
    backgroundColor: "white",
    borderColor: "#E5E7EB",
  },
  amountContainer: {
    alignItems: "center",
    marginTop: 4,
  },
  amountText: {
    fontSize: RFValue(14),
    fontWeight: "600",
    color: "#111",
  },
  submitButton: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#FFD700",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonText: {
    fontSize: RFValue(16),
    fontWeight: "bold",
    color: "#000",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 4,
    borderRadius: 50,
  },
});

export default CheckIn;
