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
        <View style={styles.card}>
          <Text style={styles.title}>Checkout Receipt</Text>

          <ScrollView style={{ maxHeight: 350 }}>
            <InfoRow label="Name" value={name} />
            <InfoRow label="Mobile" value={mobileNumber} />
            <InfoRow
              label="Vehicle"
              value={`${vehicleType.toUpperCase()} - ${numberPlate}`}
            />

            <View style={styles.divider} />

            <InfoRow label="Entry Date" value={entryDate} />
            <InfoRow label="Exit Date" value={exitDate} />
            <InfoRow label="Time Used" value={timeUsed} />
            <InfoRow label="Rate / Day" value={perDayRate} />
            <InfoRow label="Paid Days" value={paidDays.toString()} />
            <InfoRow label="Paid Amount" value={paidAmount} />
            <InfoRow label="Extra Days" value={extraDays.toString()} />
            <InfoRow label="Extra Charges" value={extraAmount} />

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
              <Text style={styles.btnTextBlack}>Proceed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element => (
  <View style={styles.section}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

export default ExtraPayModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#f6f6f6",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#000",
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontWeight: "500",
    color: "#555",
  },
  value: {
    fontWeight: "600",
    color: "#111",
  },
  divider: {
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    marginVertical: 12,
  },
  totalContainer: {
    marginTop: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
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
    backgroundColor: "#ddd",
    padding: 12,
    borderRadius: 20,
    marginRight: 8,
    alignItems: "center",
  },
  proceedBtn: {
    flex: 1,
    backgroundColor: "#FFD500",
    padding: 12,
    borderRadius: 20,
    marginLeft: 8,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  btnTextBlack: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
});
