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
        text1: "Error",
        text2: "Please fill all required fields",
        position: "top",
        visibilityTime: 2000,
      });
      setIsLoading(false);
      return;
    }

    const amount = calculateAmount();
    if (!amount) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not determine amount. Please check prices.",
        position: "top",
        visibilityTime: 2000,
      });
      setIsLoading(false);
      return;
    }

    const result = await createMonthlyPass({ ...formData, amount });
    setIsLoading(false);

    if (!result.success) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: result.error || "Error in API",
        position: "top",
        visibilityTime: 2000,
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Pass Created Successfully",
      position: "top",
      visibilityTime: 2000,
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
    }, 2000);
  };

  return (
    <Modal visible={isModalVisible} animationType="fade" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create New Pass</Text>
          <TextInput
            style={styles.input}
            placeholder="Customer Name"
            placeholderTextColor="#888"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            placeholderTextColor="#888"
            maxLength={10}
            keyboardType="phone-pad"
            value={formData.mobile}
            onChangeText={(text) => setFormData({ ...formData, mobile: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Vehicle Number"
            placeholderTextColor="#888"
            value={formData.vehicleNo}
            keyboardType="default"
            onChangeText={(text) =>
              setFormData({ ...formData, vehicleNo: text })
            }
            onBlur={() =>
              setFormData({
                ...formData,
                vehicleNo: formData.vehicleNo.toUpperCase(),
              })
            }
            autoCapitalize="characters"
          />

          <DropDownPicker
            textStyle={{ color: "#000" }}
            labelStyle={{ color: "#000" }}
            open={openVehicleType}
            value={formData.vehicleType}
            items={vehicleTypeItems}
            setOpen={setOpenVehicleType}
            setValue={(cb) =>
              setFormData((prev) => ({
                ...prev,
                vehicleType: cb(prev.vehicleType),
              }))
            }
            setItems={() => {}}
            placeholder="Select Vehicle Type"
            style={styles.picker}
            dropDownContainerStyle={{ backgroundColor: "#DBEAFE" }}
            zIndex={3000}
            zIndexInverse={1000}
          />

          <DropDownPicker
            textStyle={{ color: "#000" }}
            labelStyle={{ color: "#000" }}
            open={openDuration}
            value={formData.duration}
            items={durationItems}
            setOpen={setOpenDuration}
            setValue={(cb) =>
              setFormData((prev) => ({ ...prev, duration: cb(prev.duration) }))
            }
            setItems={() => {}}
            placeholder="Select Duration"
            style={styles.picker}
            dropDownContainerStyle={{ backgroundColor: "#DBEAFE" }}
            zIndex={2000}
            zIndexInverse={2000}
          />

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setDatePickerVisible(true)}
          >
            <Text style={styles.datePickerText}>
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
            textStyle={{ color: "#000" }}
            labelStyle={{ color: "#000" }}
            open={openPayment}
            value={formData.paymentMethod}
            items={paymentMethodItems}
            setOpen={setOpenPayment}
            setValue={(cb) =>
              setFormData((prev) => ({
                ...prev,
                paymentMethod: cb(prev.paymentMethod),
              }))
            }
            setItems={() => {}}
            placeholder="Select Payment Method"
            style={styles.picker}
            dropDownContainerStyle={{ backgroundColor: "#DBEAFE" }}
            zIndex={1000}
            zIndexInverse={3000}
          />

          <TextInput
            style={styles.input}
            placeholder="End Date (YYYY-MM-DD)"
            placeholderTextColor="#888"
            value={formData.endDate}
            editable={false}
          />

          {formData.vehicleType && formData.duration && (
            <View style={styles.amountContainer}>
              <Text style={styles.amountText}>
                Payment Method: {formData.paymentMethod || "Not selected"}
              </Text>
              <Text style={styles.amountText}>
                Amount: ₹{calculateAmount()}
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreatePass}
            >
              {isLoading ? (
                <View style={styles.loader}>
                  <ActivityIndicator size="small" color="#10B981" />
                </View>
              ) : (
                <Text style={styles.buttonText}>Create</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ToastManager showCloseIcon={false} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 8,
    width: "80%",
    zIndex: 4000,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#DBEAFE",
    borderRadius: 2,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  picker: {
    backgroundColor: "#DBEAFE",
    marginBottom: 12,
    borderColor: "#e5e7eb",
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#DBEAFE",
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
  },
  datePickerText: {
    fontSize: 16,
  },
  amountContainer: {
    marginTop: 8,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
  },
  createButton: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  loader: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 50,
  },
});

export default MonthlyPassModal;
