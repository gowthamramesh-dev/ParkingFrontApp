import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Image,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import MonthlyPassModal from "../../../components/monthlyPassModal";
import userAuthStore from "@/utils/store";
import { Toast } from "toastify-react-native";
import { useNavigation } from "@react-navigation/native";
import AccessControl from "@/components/AccessControl";

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;
const TABS = ["create", "active", "expired"] as const;

const MonthlyPass = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("create");
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
  const navigation = useNavigation<any>();

  useEffect(() => {
    const unsubscribe = navigation.addListener("tabPress", async () => {
      if (activeTab !== "create") {
        setIsTabLoading(true);
        await getMonthlyPass(activeTab);
        setIsTabLoading(false);
      }
    });

    return unsubscribe;
  }, [navigation]);

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
    // Common styles for both active and expired passes
    const isActiveTab = activeTab === "active";

    return (
      <View style={styles.activeCard}>
        <View style={styles.cardCutout} />
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardName}>{item.name}</Text>
          <View
            style={[
              styles.activePill,
              { backgroundColor: isActiveTab ? "#fff" : "#f0f0f0" },
            ]}
          >
            <Text style={styles.activePillText}>
              {isActiveTab ? "Active" : "Expired"}
            </Text>
          </View>
        </View>
        <View style={styles.iconCircle}>
          <MaterialIcons name="directions-car" size={30} color="#000" />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <Text style={styles.label}>Vehicle No:</Text>
          <View style={styles.vehicleRow}>
            <Text style={styles.vehicleText}>{item.vehicleNo}</Text>
            <MaterialIcons name="content-copy" size={16} color="#000" />
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginBottom: 8,
            alignItems: "center",
          }}
        >
          <Text style={styles.label}>Mobile:</Text>
          <Text style={styles.value}>{item.mobile}</Text>
        </View>

        <View style={styles.infoRow}>
          <View>
            <Text style={styles.label}>Duration</Text>
            <View style={styles.editRow}>
              <Text style={styles.value}>{item.duration} Months</Text>
              {isActiveTab && (
                <TouchableOpacity
                  onPress={() => {
                    setEditPassId(item._id);
                    setShowDurationModal(true);
                  }}
                >
                  <MaterialIcons name="edit" size={16} color="#000" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View>
            <Text style={styles.label}>Valid Till</Text>
            <Text style={styles.value}>
              {new Date(item.endDate).toLocaleDateString()}
            </Text>
          </View>

          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Text style={styles.label}>Payment</Text>
            <Text style={styles.value}>{item.paymentMode}</Text>
          </View>
        </View>

        <View style={styles.bottomStrip}>
          <Text style={styles.label}>Pass ID</Text>
          <Text style={styles.value}>#{item._id.slice(-6).toUpperCase()}</Text>
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>₹{item.amount}</Text>
          </View>
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
    <AccessControl required="monthlyPass">
      <View style={styles.container}>
        <View
          style={{
            backgroundColor: "#f6f6f6",
            marginHorizontal: 10,
            marginBottom: 20,
            borderRadius: 12,
          }}
        >
          <View style={styles.headerBox}>
            <Text style={styles.headerTitle}>Monthly Pass</Text>
          </View>
          <View style={styles.tabsContainer}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabPill,
                    isActive ? styles.tabPillActive : styles.tabPillInactive,
                  ]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    style={
                      isActive ? styles.tabTextActive : styles.tabTextInactive
                    }
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {activeTab === "create" ? (
          <View
            style={{
              flex: 1,
              backgroundColor: "transparent",
              zIndex: 2,
              elevation: 2,
            }}
          >
            <Image
              source={require("../../../assets/checkOutPark.png")}
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
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setModalVisible(true)}
              disabled={isLoading}
            >
              <Text style={styles.createButtonText}>Create New Pass</Text>
            </TouchableOpacity>
          </View>
        ) : isTabLoading ? (
          <ActivityIndicator
            size="large"
            color="#ffcd01"
            style={styles.loader}
          />
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: "transparent",
              zIndex: 2,
              elevation: 2,
            }}
          >
            <Image
              source={require("../../../assets/checkOutPark.png")}
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
            <FlatList
              data={data}
              renderItem={renderPassItem}
              keyExtractor={(item) => item._id}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No {activeTab} passes</Text>
              }
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
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
                  <Text style={styles.cancelButtonText}>Cancel</Text>
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
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },

  headerBox: {
    margin: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#9CA3AF",
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  activeCard: {
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: "#ffe57c",
    borderRadius: 16,
    padding: 10,
    position: "relative",
    overflow: "hidden",
    elevation: 5,
  },

  cardCutout: {
    position: "absolute",
    top: -30,
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: 40,
    backgroundColor: "#fff",
    zIndex: 1,
  },

  iconCircle: {
    position: "absolute",
    top: -25,
    right: -25,
    backgroundColor: "#fff",
    width: 100,
    height: 100,
    opacity: 0.5,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
    marginBottom: 5,
  },

  cardName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },

  activePill: {
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  activePillText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#000",
  },

  vehicleRow: {
    flexDirection: "row",
    backgroundColor: "#ffff",
    padding: 4,
    borderRadius: 8,
    alignItems: "center",
    gap: 6,
  },

  vehicleText: {
    fontSize: 14,
    color: "#000",
  },

  label: {
    fontSize: 16,
    color: "#333",
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },

  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  bottomStrip: {
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    marginTop: 16,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  priceTag: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  priceText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },

  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 6,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  tabPillActive: {
    backgroundColor: "#ffcd01",
    borderColor: "#ffcd01",
  },
  tabPillInactive: {
    backgroundColor: "#fff",
    borderColor: "#9CA3AF",
  },
  tabTextActive: {
    color: "#000",
    fontWeight: "600",
  },
  tabTextInactive: {
    color: "#000",
    fontWeight: "500",
  },

  createButton: {
    zIndex: 2,
    elevation: 5,
    backgroundColor: "#ffcd01",
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  createButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalBox: {
    backgroundColor: "#f6f6f6",
    borderRadius: 20,
    padding: 20,
    width: 300,
    alignItems: "center",
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#000",
  },
  durationOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  durationButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 2,
  },
  selectedDuration: {
    backgroundColor: "#FFD500",
  },
  unselectedDuration: {
    backgroundColor: "#fff",
  },
  selectedDurationText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  unselectedDurationText: {
    color: "#555",
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: "#E5E7EB",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#000",
    fontWeight: "500",
  },
  extendButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#FFD500",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  extendButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default MonthlyPass;
