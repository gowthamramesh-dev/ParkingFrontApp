// Same imports...
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import DatePicker from "@react-native-community/datetimepicker";
import useAuthStore from "../utils/store";
import ToastManager, { Toast } from "toastify-react-native";
import DropDownPicker from "react-native-dropdown-picker";

interface FormData {
  name: string;
  vehicleNo: string;
  mobile: string;
  vehicleType: string;
  duration: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
  amount?: number;
}

type VehicleType = "cycle" | "bike" | "car" | "van" | "lorry" | "bus";

interface MonthlyPassModalProps {
  isModalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  onPassCreated: (pass: any) => void;
}

const MonthlyPassModal: React.FC<MonthlyPassModalProps> = ({
  isModalVisible,
  setModalVisible,
  onPassCreated,
}) => {
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    vehicleNo: "",
    mobile: "",
    vehicleType: "",
    duration: "",
    paymentMethod: "cash",
    startDate: "",
    endDate: "",
  });

  const { createMonthlyPass, priceData } = useAuthStore();

  const [openVehicleType, setOpenVehicleType] = useState(false);
  const [openDuration, setOpenDuration] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);

  const vehicleTypeItems = [
    { label: "Cycle", value: "cycle" },
    { label: "Bike", value: "bike" },
    { label: "Car", value: "car" },
    { label: "Van", value: "van" },
    { label: "Lorry", value: "lorry" },
    { label: "Bus", value: "bus" },
  ];

  const durationItems = [
    { label: "3 months", value: "3" },
    { label: "6 months", value: "6" },
    { label: "9 months", value: "9" },
    { label: "12 months", value: "12" },
  ];

  const paymentMethodItems = [
    { label: "Cash", value: "cash" },
    { label: "GPay", value: "gpay" },
    { label: "PhonePe", value: "phonepe" },
    { label: "Paytm", value: "paytm" },
  ];

  useEffect(() => {
    if (formData.startDate && formData.duration) {
      const startDate = new Date(formData.startDate);
      const months = parseInt(formData.duration, 10);
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + months);
      setFormData((prev) => ({
        ...prev,
        endDate: endDate.toISOString().split("T")[0],
      }));
    }
  }, [formData.startDate, formData.duration]);

  const calculateAmount = () => {
    const duration = parseInt(formData.duration || "0");
    const vehicleType = formData.vehicleType as VehicleType;
    if (!priceData?.monthlyPrices || !vehicleType || !duration) return 0;
    const monthlyRate = Number(priceData.monthlyPrices[vehicleType]);
    return isNaN(monthlyRate) ? 0 : monthlyRate * duration;
  };

  const handleCreatePass = async () => {
    setIsLoading(true);
    const requiredFields = [
      "name",
      "vehicleNo",
      "mobile",
      "vehicleType",
      "duration",
      "paymentMethod",
      "startDate",
    ];
    const missing = requiredFields.some((field) => !formData[field]);

    if (missing) {
      Toast.show({
        type: "error",
        text1: "Please fill all required fields",
        position: "top",
      });
      setIsLoading(false);
      return;
    }

    const amount = calculateAmount();
    if (!amount) {
      Toast.show({
        type: "error",
        text1: "Could not determine amount",
        position: "top",
      });
      setIsLoading(false);
      return;
    }

    const result = await createMonthlyPass({ ...formData, amount });
    setIsLoading(false);

    if (!result.success) {
      Toast.show({
        type: "error",
        text1: result.error || "Error in API",
        position: "top",
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "Pass Created Successfully",
      position: "top",
    });

    setFormData({
      name: "",
      vehicleNo: "",
      mobile: "",
      vehicleType: "",
      duration: "",
      paymentMethod: "cash",
      startDate: "",
      endDate: "",
    });

    setTimeout(() => {
      setModalVisible(false);
      onPassCreated(result.pass);
    }, 1500);
  };

  return (
    <Modal visible={isModalVisible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={{ position: "relative", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.title}>Create New Pass</Text>

            <TextInput
              style={styles.input}
              placeholder="Customer Name"
              placeholderTextColor="#999"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              placeholderTextColor="#999"
              maxLength={10}
              keyboardType="phone-pad"
              value={formData.mobile}
              onChangeText={(text) =>
                setFormData({ ...formData, mobile: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Vehicle Number"
              placeholderTextColor="#999"
              value={formData.vehicleNo}
              onChangeText={(text) =>
                setFormData({ ...formData, vehicleNo: text.toUpperCase() })
              }
              autoCapitalize="characters"
            />

            <DropDownPicker
              placeholder="Select Vehicle Type"
              items={vehicleTypeItems}
              open={openVehicleType}
              value={formData.vehicleType}
              setOpen={setOpenVehicleType}
              setValue={(cb) =>
                setFormData((prev) => ({
                  ...prev,
                  vehicleType: cb(prev.vehicleType),
                }))
              }
              setItems={() => {}}
              style={styles.input}
              dropDownContainerStyle={styles.dropdown}
              zIndex={3000}
              zIndexInverse={1000}
            />

            <DropDownPicker
              placeholder="Select Duration"
              items={durationItems}
              open={openDuration}
              value={formData.duration}
              setOpen={setOpenDuration}
              setValue={(cb) =>
                setFormData((prev) => ({
                  ...prev,
                  duration: cb(prev.duration),
                }))
              }
              setItems={() => {}}
              style={styles.input}
              dropDownContainerStyle={styles.dropdown}
              zIndex={2000}
              zIndexInverse={2000}
            />

            <TouchableOpacity
              style={styles.input}
              onPress={() => setDatePickerVisible(true)}
            >
              <Text style={{ color: formData.startDate ? "#000" : "#999" }}>
                {formData.startDate || "Select Start Date"}
              </Text>
            </TouchableOpacity>

            {isDatePickerVisible && (
              <DatePicker
                value={
                  formData.startDate ? new Date(formData.startDate) : new Date()
                }
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setDatePickerVisible(false);
                  if (date) {
                    setFormData({
                      ...formData,
                      startDate: date.toISOString().split("T")[0],
                    });
                  }
                }}
              />
            )}

            <DropDownPicker
              placeholder="Cash"
              items={paymentMethodItems}
              open={openPayment}
              value={formData.paymentMethod}
              setOpen={setOpenPayment}
              setValue={(cb) =>
                setFormData((prev) => ({
                  ...prev,
                  paymentMethod: cb(prev.paymentMethod),
                }))
              }
              setItems={() => {}}
              style={styles.input}
              dropDownContainerStyle={styles.dropdown}
              zIndex={1000}
              zIndexInverse={3000}
            />

            <TextInput
              style={styles.input}
              placeholder="End Date(yyy-mm-dd)"
              placeholderTextColor="#999"
              value={formData.endDate}
              editable={false}
            />
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                paddingHorizontal: 12,
                paddingVertical: 5,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }}>
                {formData.paymentMethod.toUpperCase() || "Not selected"} :
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }}>
                {" "}
                ₹{calculateAmount()}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreatePass}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loader}>
                  <ActivityIndicator size="small" color="#ffcd01" />
                </View>
              ) : (
                <Text style={styles.createText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ToastManager />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#f6f6f6",
    width: 300,
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    zIndex: 0,
  },
  closeButton: {
    position: "absolute",
    top: -60,
    alignSelf: "center",
    backgroundColor: "#f6f6f6",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    zIndex: 9999,
  },
  closeButtonText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 0,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    height: 48,
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 0,
    borderRadius: 12,
    elevation: 4,
  },
  createButton: {
    backgroundColor: "#FFD500",
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  createText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  loader: {
    backgroundColor: "#fff",
    padding: 2,
    borderRadius: 50,
  },
});

export default MonthlyPassModal;
