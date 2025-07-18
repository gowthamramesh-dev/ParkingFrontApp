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
import { Picker } from "@react-native-picker/picker";
import DatePicker from "@react-native-community/datetimepicker";
import useAuthStore from "../utils/store";
import ToastManager, { Toast } from "toastify-react-native";

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
  onPassCreated: (pass: any) => void; // Adjusted to `any` to accommodate potential pass structure
}

const MonthlyPassModal: React.FC<MonthlyPassModalProps> = ({
  isModalVisible,
  setModalVisible,
  onPassCreated,
}) => {
  const [isDatePickerVisible, setDatePickerVisible] = useState<boolean>(false);
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

  useEffect(() => {
    if (formData.startDate && formData.duration) {
      const startDate = new Date(formData.startDate);
      const months = parseInt(formData.duration, 10);
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + months);
      setFormData({
        ...formData,
        endDate: endDate.toISOString().split("T")[0],
      });
    }
  }, [formData.startDate, formData.duration]);

  const calculateAmount = () => {
    const duration = parseInt(formData.duration || "0");
    const vehicleType = formData.vehicleType as VehicleType;

    if (!priceData?.monthlyPrices || !vehicleType || !duration) return 0;

    const monthlyRate = Number(priceData.monthlyPrices[vehicleType]);
    if (isNaN(monthlyRate)) return 0;

    return monthlyRate * duration;
  };

  const handleCreatePass = async () => {
    setIsLoading(true);
    if (
      !formData.name ||
      !formData.vehicleNo ||
      !formData.mobile ||
      !formData.vehicleType ||
      !formData.duration ||
      !formData.paymentMethod ||
      !formData.startDate
    ) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill all required fields",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
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
        autoHide: true,
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
        autoHide: true,
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "Success",
      text2: "Pass Created Successfully",
      position: "top",
      visibilityTime: 2000,
      autoHide: true,
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
            onChangeText={(text: string) =>
              setFormData({ ...formData, name: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            placeholderTextColor="#888"
            maxLength={10}
            value={formData.mobile}
            onChangeText={(text: string) =>
              setFormData({ ...formData, mobile: text })
            }
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Vehicle Number"
            placeholderTextColor="#888"
            keyboardType="default"
            value={formData.vehicleNo}
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

          <View>
            <Picker
              selectedValue={formData.vehicleType}
              onValueChange={(text) =>
                setFormData({ ...formData, vehicleType: text })
              }
              style={styles.picker}
            >
              <Picker.Item color="#000" label="Select Vehicle Type" value="" />
              <Picker.Item color="#000" label="Cycle" value="cycle" />
              <Picker.Item color="#000" label="Bike" value="bike" />
              <Picker.Item color="#000" label="Car" value="car" />
              <Picker.Item color="#000" label="Van" value="van" />
              <Picker.Item color="#000" label="Lorry" value="lorry" />
              <Picker.Item color="#000" label="Bus" value="bus" />
            </Picker>
          </View>
          <View>
            <Picker
              selectedValue={formData.duration}
              onValueChange={(text) =>
                setFormData({ ...formData, duration: text })
              }
              style={styles.picker}
            >
              <Picker.Item color="#000" label="Select Duration" value="" />
              {[3, 6, 9, 12].map((m) => (
                <Picker.Item
                  color="#000"
                  key={m}
                  label={`${m} months`}
                  value={`${m}`}
                />
              ))}
            </Picker>
          </View>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setDatePickerVisible(true)}
          >
            <Text style={styles.datePickerText}>
              {formData.startDate ? formData.startDate : "Select Start Date"}
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
          <View>
            <Picker
              selectedValue={formData.paymentMethod}
              onValueChange={(text) =>
                setFormData({ ...formData, paymentMethod: text })
              }
              style={styles.picker}
            >
              <Picker.Item
                color="#000"
                label="Select Payment Method"
                value=""
              />
              <Picker.Item color="#000" label="Cash" value="cash" />
              <Picker.Item color="#000" label="GPay" value="gpay" />
              <Picker.Item color="#000" label="PhonePe" value="phonepe" />
              <Picker.Item color="#000" label="Paytm" value="paytm" />
            </Picker>
          </View>
          <TextInput
            style={styles.input}
            placeholderTextColor="#888"
            placeholder="End Date (YYYY-MM-DD)"
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
                <View style={styles.loadingContainer}>
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
    color: "black",
    height: 48,
    backgroundColor: "#DBEAFE",
    marginBottom: 12,
    borderRadius: 2,
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
  loadingContainer: {
    backgroundColor: "#ffffff",
    padding: 4,
    borderRadius: 50,
  },
});

export default MonthlyPassModal;
