import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Scan from "./Scan";
import userAuthStore from "@/utils/store";
import ToastManager, { Toast } from "toastify-react-native";
import CheckoutModal from "./ExtraPayModel";
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
      <Text style={styles.title}>Check Out</Text>
      <View style={styles.formContainer}>
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
              <ActivityIndicator size="small" color="#10B981" />
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
    padding: 16,
    gap: 20,
  },
  title: {
    fontSize: 22,
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
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    borderRadius: 4,
    height: 48,
    backgroundColor: "#ebf8ff",
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 20,
  },
  scanButton: {
    marginLeft: 8,
  },
  scanContainer: {
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "#4ade80",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    textAlign: "center",
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "600",
  },
  loadingContainer: {
    backgroundColor: "#ffffff",
    padding: 4,
    borderRadius: 50,
  },
});

export default CheckOut;
