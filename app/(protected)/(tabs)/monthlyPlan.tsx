import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import MonthlyPassModal from "../../../components/monthlyPassModal";
import userAuthStore from "@/utils/store";
import { Toast } from "toastify-react-native";

const TABS = ["create", "active", "expired"] as const;

const MonthlyPass = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("active");
  const [editPassId, setEditPassId] = useState<string | null>(null);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState<number>(3);
  const [isTabLoading, setIsTabLoading] = useState(false);

  const {
    getMonthlyPass,
    monthlyPassActive,
    monthlyPassExpired,
    isLoading,
    extendMonthlyPass,
  } = userAuthStore();

  useEffect(() => {
    const fetchTabData = async () => {
      if (activeTab !== "create") {
        setIsTabLoading(true);
        await getMonthlyPass(activeTab);
        setIsTabLoading(false);
      }
    };
    fetchTabData();
  }, [activeTab]);

  const handlePassCreated = () => {
    setModalVisible(false);
    if (activeTab === "active") {
      getMonthlyPass("active");
    }
  };

  const handleExtend = async () => {
    if (!editPassId) return;

    const result = await extendMonthlyPass(editPassId, selectedMonths);

    if (!result.success) {
      Toast.show({
        type: "error",
        text1: result.error || "Something went wrong",
      });
      return;
    }

    Toast.show({ type: "success", text1: "Duration extended successfully" });
    setTimeout(() => {
      setShowDurationModal(false);
      getMonthlyPass(activeTab);
    }, 2000);
  };

  const renderPassItem = ({ item }: any) => {
    const cardStyles = [
      styles.passCard,
      { backgroundColor: item.isExpired ? "#D1D5DB" : "#22C55E" },
    ];
    const textColor = item.isExpired ? "#000" : "#fff";

    return (
      <View style={cardStyles}>
        <View style={styles.cardCircle} />
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            {item.name}
          </Text>
          <MaterialIcons name="directions-car" size={24} color={textColor} />
        </View>
        <View style={styles.cardInfoGroup}>
          <Text style={[styles.cardInfoText, { color: textColor }]}>
            Vehicle No: <Text style={styles.bold}>{item.vehicleNo}</Text>
          </Text>
          <Text style={[styles.cardInfoText, { color: textColor }]}>
            Mobile: {item.mobile}
          </Text>
        </View>
        <View style={styles.cardFooter}>
          <View>
            <Text style={[styles.cardLabel, { color: textColor }]}>
              Duration
            </Text>
            <View style={styles.rowCenter}>
              <Text style={[styles.cardValue, { color: textColor }]}>
                {item.duration} months
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setEditPassId(item._id);
                  setShowDurationModal(true);
                }}
              >
                <MaterialIcons name="edit" size={18} color={textColor} />
              </TouchableOpacity>
            </View>
          </View>
          <View>
            <Text style={[styles.cardLabel, { color: textColor }]}>
              Valid Till
            </Text>
            <Text style={[styles.cardValue, { color: textColor }]}>
              {" "}
              {new Date(item.endDate).toLocaleDateString()}
            </Text>
          </View>
          <View>
            <Text style={[styles.cardLabel, { color: textColor }]}>
              Payment
            </Text>
            <Text style={[styles.cardValue, { color: textColor }]}>
              {item.paymentMode}
            </Text>
          </View>
        </View>
        <View style={styles.passIdSection}>
          <Text style={[styles.cardLabel, { color: textColor }]}>Pass ID</Text>
          <Text style={[styles.cardIdValue, { color: textColor }]}>
            #{item._id.slice(-6).toUpperCase()}
          </Text>
        </View>
      </View>
    );
  };

  const data =
    activeTab === "active"
      ? monthlyPassActive
      : activeTab === "expired"
        ? monthlyPassExpired
        : [];

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Monthly Pass</Text>
      </View>

      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab ? styles.activeTab : styles.inactiveTab,
            ]}
            disabled={isTabLoading}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={
                activeTab === tab
                  ? styles.activeTabText
                  : styles.inactiveTabText
              }
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "create" ? (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setModalVisible(true)}
          disabled={isLoading}
        >
          <Text style={styles.createButtonText}>Create New Pass</Text>
        </TouchableOpacity>
      ) : isTabLoading ? (
        <ActivityIndicator size="large" color="#22c55e" style={styles.loader} />
      ) : (
        <FlatList
          data={data}
          renderItem={renderPassItem}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No {activeTab} passes</Text>
          }
        />
      )}

      <Modal visible={showDurationModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Extend Duration</Text>
            <View style={styles.durationOptions}>
              {[3, 6, 9, 12].map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setSelectedMonths(m)}
                  style={[
                    styles.durationButton,
                    selectedMonths === m
                      ? styles.selectedDuration
                      : styles.unselectedDuration,
                  ]}
                >
                  <Text
                    style={
                      selectedMonths === m
                        ? styles.selectedDurationText
                        : styles.unselectedDurationText
                    }
                  >
                    {m} mo
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDurationModal(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.extendButton}
                onPress={handleExtend}
              >
                <Text style={styles.extendButtonText}>Extend</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <MonthlyPassModal
        isModalVisible={isModalVisible}
        setModalVisible={setModalVisible}
        onPassCreated={handlePassCreated}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  headerBox: {
    margin: 16,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 4,
    elevation: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: "600" },
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeTab: { backgroundColor: "#16a34a" },
  inactiveTab: { backgroundColor: "white" },
  activeTabText: { color: "white", fontSize: 16, fontWeight: "500" },
  inactiveTabText: { color: "black", fontSize: 16, fontWeight: "500" },
  createButton: {
    backgroundColor: "#16a34a",
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: "center",
  },
  createButtonText: { color: "white", fontSize: 16, fontWeight: "500" },
  loader: { marginTop: 40 },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "gray",
  },
  passCard: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    padding: 20,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },
  cardCircle: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: { fontSize: 20, fontWeight: "bold" },
  cardInfoGroup: { marginBottom: 8 },
  cardInfoText: { fontSize: 14, fontWeight: "500" },
  bold: { fontWeight: "bold" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  cardLabel: { fontSize: 12 },
  cardValue: { fontSize: 16, fontWeight: "600" },
  passIdSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.3)",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardIdValue: { fontSize: 12, fontWeight: "600" },
  rowCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    width: 288,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  durationOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  durationButton: {
    margin: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
  },
  selectedDuration: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  unselectedDuration: { backgroundColor: "#E5E7EB", borderColor: "#D1D5DB" },
  selectedDurationText: { color: "white", fontWeight: "500" },
  unselectedDurationText: { color: "black", fontWeight: "500" },
  modalActions: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#D1D5DB",
    borderRadius: 4,
  },
  extendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#16a34a",
    borderRadius: 4,
  },
  extendButtonText: { color: "white", fontWeight: "500" },
});

export default MonthlyPass;
