import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Pressable,
  Platform,
  Clipboard,
  ToastAndroid,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import userAuthStore from "@/utils/store";
import { useNavigation } from "@react-navigation/native";
import ToastManager, { Toast } from "toastify-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AccessControl from "@/components/AccessControl";

const AllStaffs = () => {
  const { getAllStaffs, staffs, isLoading, deleteStaff, updateStaff } =
    userAuthStore();

  const [isModalVisible, setModalVisible] = useState(false);
  const [editStaffId, setEditStaffId] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [buildingName, setBuildingName] = useState("");
  const [buildingLocation, setBuildingLocation] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    const res = await getAllStaffs();
    if (!res.success) {
      Toast.show({
        type: "error",
        text1: "Failed to fetch staff list",
        text2: res.error || "",
      });
    }
  };

  const handleDelete = (staffId) => {
    Alert.alert("Delete Staff", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          const result = await deleteStaff(staffId);
          if (!result.success) {
            Toast.show({
              type: "error",
              text1: "Delete Failed",
              text2: result.error || "Failed to delete staff",
            });
          } else {
            Toast.show({
              type: "success",
              text1: "Deleted Successfully",
              visibilityTime: 2000,
            });
            await fetchStaffs();
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleEditPress = (staff) => {
    setEditStaffId(staff._id);
    setEditUsername(staff.username);
    setEditPassword("");
    setPasswordVisible(false);
    setBuildingName(staff?.building?.name || "");
    setBuildingLocation(staff?.building?.location || "");
    setModalVisible(true);
  };

  const handleSaveUpdate = async () => {
    if (!editStaffId || !editUsername) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Username is required.",
      });
      return;
    }

    const updates = {
      username: editUsername,
      building: {
        name: buildingName,
        location: buildingLocation,
      },
    };

    if (editPassword) updates.password = editPassword;

    const result = await updateStaff(editStaffId, updates);
    if (!result.success) {
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: result.error || "Failed to update staff",
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Staff Updated ✅",
        text2: "Changes saved successfully.",
      });
      setModalVisible(false);
      fetchStaffs();
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.username}>{item.username}</Text>
        <View style={styles.actionIcons}>
          <TouchableOpacity onPress={() => setSelectedStaff(item)}>
            <Ionicons name="eye-outline" size={22} color="#065F46" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleEditPress(item)}>
            <Ionicons name="create-outline" size={22} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item._id)}>
            <Ionicons name="trash-outline" size={22} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderBlurWrapper = (children) => {
    return Platform.OS === "android" ? (
      <View style={styles.androidBlur}>{children}</View>
    ) : (
      <BlurView intensity={80} tint="light" style={styles.blurView}>
        {children}
      </BlurView>
    );
  };

  return (
    <AccessControl required="edit/DeleteStaff">
      <SafeAreaView style={styles.container}>
        <View style={styles.headers}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={28} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Staff details</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="lightgreen" />
        ) : staffs.length === 0 ? (
          <Text style={styles.noStaffText}>No staff found</Text>
        ) : (
          <FlatList
            data={staffs}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
          />
        )}

        {/* Edit Modal */}
        <Modal visible={isModalVisible} animationType="slide" transparent>
          {renderBlurWrapper(
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}> Edit Staff Details</Text>

              <TextInput
                value={editUsername}
                onChangeText={setEditUsername}
                placeholder="Username"
                style={styles.inputField}
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  value={editPassword}
                  onChangeText={setEditPassword}
                  placeholder="New Password (optional)"
                  secureTextEntry={!passwordVisible}
                  style={styles.inputField}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={passwordVisible ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>

              <TextInput
                value={buildingName}
                onChangeText={setBuildingName}
                placeholder="Building Name"
                style={styles.inputField}
              />

              <TextInput
                value={buildingLocation}
                onChangeText={setBuildingLocation}
                placeholder="Building Location"
                style={[styles.inputField, { marginBottom: 16 }]}
              />

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSaveUpdate} style={styles.saveButton}>
                  <Text style={styles.saveText}>Save</Text>
                </Pressable>
              </View>
            </View>
          )}
        </Modal>

        {/* View Staff Modal */}
        <Modal
          visible={!!selectedStaff}
          animationType="fade"
          transparent
          onRequestClose={() => setSelectedStaff(null)}
        >
          {renderBlurWrapper(
            <View style={styles.viewBox}>
              <Text style={styles.viewTitle}> Staff Credentials</Text>

              <View style={styles.viewSection}>
                <View style={styles.viewRow}>
                  <Ionicons
                    name="person-circle-outline"
                    size={22}
                    color="#4B5563"
                  />
                  <View>
                    <Text style={styles.viewLabel}>Username</Text>
                    <Text style={styles.viewValue}>
                      {selectedStaff?.username}
                    </Text>
                  </View>
                </View>

                <View style={styles.viewRowBetween}>
                  <View style={styles.viewRow}>
                    <Ionicons name="key-outline" size={20} color="#4B5563" />
                    <View>
                      <Text style={styles.viewLabel}>Password</Text>
                      <Text style={styles.viewValue}>
                        {passwordVisible ? selectedStaff?.password : "••••••••"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.iconActions}>
                    <TouchableOpacity
                      onPress={() => setPasswordVisible(!passwordVisible)}
                    >
                      <Ionicons
                        name={
                          passwordVisible ? "eye-outline" : "eye-off-outline"
                        }
                        size={22}
                        color="gray"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        Clipboard.setString(selectedStaff?.password || "");
                        Platform.OS === "android"
                          ? ToastAndroid.show(
                              "Password copied!",
                              ToastAndroid.SHORT
                            )
                          : Toast.show({
                              type: "success",
                              text1: "Password copied!",
                            });
                      }}
                    >
                      <Ionicons name="copy-outline" size={22} color="gray" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <Pressable
                onPress={() => setSelectedStaff(null)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
          )}
        </Modal>

        <ToastManager showCloseIcon={false} />
      </SafeAreaView>
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", // gray-50
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  headers: {
    backgroundColor: "#ffffff", // green-600
    borderRadius: 10,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: "50%",
    marginTop: -14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000",
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#ECFDF5", // green-50
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  username: {
    fontSize: 17,
    fontWeight: "600",
    color: "#065F46", // green-700
  },
  actionIcons: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  noStaffText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
    marginTop: 40,
  },

  // ✅ Modal Box (edit or view)
  modalBox: {
    backgroundColor: "#FFFFFF",
    width: "92%",
    borderRadius: 16,
    padding: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#16A34A",
    textAlign: "center",
    marginBottom: 16,
  },

  // ✅ Input Field
  inputField: {
    backgroundColor: "#F0FDF4", // green-50
    borderWidth: 1,
    borderColor: "#BBF7D0", // green-200
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  passwordContainer: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    top: 14,
  },

  // ✅ Modal Buttons
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: "#E5E7EB", // gray-200
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelText: {
    color: "#1F2937",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#16A34A", // green-600
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveText: {
    color: "white",
    fontWeight: "600",
  },

  // ✅ BlurView Modal
  androidBlur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  blurView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  // ✅ View Staff Modal
  viewBox: {
    backgroundColor: "#FFFFFF",
    width: "92%",
    borderRadius: 16,
    padding: 24,
    elevation: 10,
  },
  viewTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#16A34A",
    textAlign: "center",
    marginBottom: 20,
  },
  viewSection: {
    gap: 16,
  },
  viewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    padding: 12,
  },
  viewRowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  viewLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  viewValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  iconActions: {
    flexDirection: "row",
    gap: 16,
  },
  closeButton: {
    marginTop: 24,
    backgroundColor: "#16A34A",
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
});

export default AllStaffs;
