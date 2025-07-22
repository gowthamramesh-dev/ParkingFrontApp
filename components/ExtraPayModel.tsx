import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

interface ReceiptTable {
  entryDate: string;
  exitDate: string;
  timeUsed: string;
  perDayRate: string;
  paidDays: number;
  paidAmount: string;
  extraDays: number;
  extraAmount: string;
  totalAmount: string;
}

interface ReceiptData {
  name: string;
  mobileNumber: string;
  vehicleType: string;
  numberPlate: string;
  table: ReceiptTable;
}

interface Props {
  visible: boolean;
  receipt: ReceiptData | null;
  onClose: () => void;
  onProceed: () => void;
}

const ExtraPayModal: React.FC<Props> = ({
  visible,
  receipt,
  onClose,
  onProceed,
}) => {
  if (!receipt) return null;

  const {
    name,
    mobileNumber,
    vehicleType,
    numberPlate,
    table: {
      entryDate,
      exitDate,
      timeUsed,
      perDayRate,
      paidDays,
      paidAmount,
      extraDays,
      extraAmount,
      totalAmount,
    },
  } = receipt;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.header}>Checkout Receipt</Text>

          <ScrollView style={{ maxHeight: 350 }}>
            <View style={styles.section}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{name}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Mobile:</Text>
              <Text style={styles.value}>{mobileNumber}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Vehicle:</Text>
              <Text style={styles.value}>
                {vehicleType.toUpperCase()} - {numberPlate}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.label}>Entry Date:</Text>
              <Text style={styles.value}>{entryDate}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Exit Date:</Text>
              <Text style={styles.value}>{exitDate}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Time Used:</Text>
              <Text style={styles.value}>{timeUsed}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Rate / Day:</Text>
              <Text style={styles.value}>{perDayRate}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Paid Days:</Text>
              <Text style={styles.value}>{paidDays}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Paid Amount:</Text>
              <Text style={styles.value}>{paidAmount}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Extra Days:</Text>
              <Text style={styles.value}>{extraDays}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Extra Charges:</Text>
              <Text style={styles.value}>{extraAmount}</Text>
            </View>
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>Total Amount to Pay:</Text>
              <Text style={styles.totalAmount}>{totalAmount}</Text>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onProceed} style={styles.proceedBtn}>
              <Text style={styles.btnText}>Proceed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ExtraPayModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    width: "100%",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontWeight: "500",
    color: "#374151",
  },
  value: {
    fontWeight: "600",
    color: "#111827",
  },
  divider: {
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 1,
    marginVertical: 12,
  },
  totalContainer: {
    marginTop: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#d1d5db",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 6,
    marginRight: 8,
    alignItems: "center",
  },
  proceedBtn: {
    flex: 1,
    backgroundColor: "#10B981",
    padding: 12,
    borderRadius: 6,
    marginLeft: 8,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
