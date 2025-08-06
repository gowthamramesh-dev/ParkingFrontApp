import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Scan from "./Scan";
import userAuthStore from "@/utils/store";
import ToastManager, { Toast } from "toastify-react-native";
import CheckoutModal from "./ExtraPayModel";

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const CheckOut = () => {
  const [Toscan, setToscan] = useState(false);
  const [tokenId, settokenId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { checkOut } = userAuthStore();
  const [receiptData, setReceiptData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    if (!tokenId) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Enter the Token ID",
        position: "top",
        visibilityTime: 1000,
        autoHide: true,
      });
      setIsLoading(false);
      return;
    }

    const result = await checkOut(tokenId, true);
    setIsLoading(false);

    if (!result.success) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: result.error || "Check-out failed",
        position: "top",
        visibilityTime: 1000,
        autoHide: true,
      });
      return;
    }

    if (result.data?.table?.extraDays > 0) {
      setReceiptData(result.data);
      setShowModal(true);
    } else {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Already Checked out",
        position: "top",
        visibilityTime: 1000,
        autoHide: true,
      });
    }
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    if (!tokenId) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Enter the Token ID",
        position: "top",
        visibilityTime: 1000,
        autoHide: true,
      });
      setIsLoading(false);
      return;
    }

    const result = await checkOut(tokenId, false);
    setIsLoading(false);

    if (!result.success) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: result.error || "Check-out failed",
        position: "top",
        visibilityTime: 1000,
        autoHide: true,
      });
      return;
    }
    Toast.show({
      type: "success",
      text1: "Vehicle Checked Out",
      text2: "Extra payment confirmed.",
      position: "top",
      visibilityTime: 1000,
      autoHide: true,
    });
    settokenId("");
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/checkInDot.png")}
        style={{
          position: "absolute",
          top: screenHeight * 0.065,
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
        source={require("../assets/checkOutPark.png")}
        style={{
          position: "absolute",
          bottom: 10,
          right: 0,
          width: screenWidth * 0.8,
          height: screenHeight * 0.25,
          opacity: 0.2,
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
          <Text style={styles.title}>Check Out</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter Token ID"
            value={tokenId}
            placeholderTextColor="#888"
            onChangeText={settokenId}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={() => setToscan(!Toscan)}
            style={styles.scanButton}
          >
            <Ionicons name="scan-outline" size={28} color="#1f2937" />
          </TouchableOpacity>
        </View>

        {Toscan && (
          <View style={styles.scanContainer}>
            <Scan
              onScanned={(data) => {
                settokenId(data);
                setToscan(false);
              }}
            />
          </View>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#ffcd01" />
            </View>
          ) : (
            <Text style={styles.submitButtonText}>Enter</Text>
          )}
        </TouchableOpacity>
      </View>

      <CheckoutModal
        visible={showModal}
        receipt={receiptData}
        onClose={() => setShowModal(false)}
        onProceed={() => {
          setShowModal(false);
          settokenId("");
          handleFinalSubmit();
        }}
      />

      <ToastManager showCloseIcon={false} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  formContainer: {
    backgroundColor: "#f6f6f6",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    padding: 16,
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    borderRadius: 12,
    height: 48,
    backgroundColor: "white",
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  scanButton: {
    marginLeft: 8,
  },
  scanContainer: {
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#ffcd01",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    textAlign: "center",
    fontSize: 20,
    color: "black",
    fontWeight: "600",
  },
  loadingContainer: {
    backgroundColor: "#ffffff",
    padding: 4,
    borderRadius: 50,
  },
});

export default CheckOut;
