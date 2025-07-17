import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
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
      <View style={styles.cardHeader}>
        <Text style={styles.username}>{item.username}</Text>
        <View style={styles.actionIcons}>
          <TouchableOpacity onPress={() => setSelectedStaff(item)}>
            <Ionicons name="eye-outline" size={22} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleEditPress(item)}>
            <Ionicons name="create-outline" size={22} color="blue" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item._id)}>
            <Ionicons name="trash-outline" size={22} color="red" />
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Staff Details</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#4F46E5" />
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
            <Text style={styles.modalTitle}>✏ Edit Staff Details</Text>

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
            <Text style={styles.viewTitle}>👤 Staff Details</Text>

            <View style={styles.viewSection}>
              <View style={styles.viewRow}>
                <Ionicons
                  name="person-circle-outline"
                  size={24}
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
                  <Ionicons name="key-outline" size={24} color="#4B5563" />
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
                      name={passwordVisible ? "eye-outline" : "eye-off-outline"}
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
  );
};

const styles = StyleSheet.create({
  modalBox: {
    backgroundColor: "white",
    width: "92%",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#047857",
    marginBottom: 16,
    textAlign: "center",
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#DBEAFE",
    fontSize: 16,
    marginBottom: 12,
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 12,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 12,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelButton: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelText: {
    color: "#1F2937",
    fontWeight: "500",
  },
  saveText: {
    color: "white",
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  noStaffText: {
    textAlign: "center",
    color: "#6B7280",
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
  },
  actionIcons: {
    flexDirection: "row",
    gap: 16,
  },
  androidBlur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "rgba(147, 197, 253, 0.1)",
    paddingHorizontal: 16,
  },
  blurView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  viewBox: {
    backgroundColor: "white",
    width: "100%",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  viewTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#4338CA", // indigo-700
  },
  viewSection: {
    gap: 16,
  },
  viewRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DBEAFE", // blue-100
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  viewRowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#DBEAFE",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  viewLabel: {
    fontSize: 10,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  viewValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  iconActions: {
    flexDirection: "row",
    gap: 16,
  },
  closeButton: {
    marginTop: 32,
    backgroundColor: "#10B981",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
});

export default AllStaffs;
