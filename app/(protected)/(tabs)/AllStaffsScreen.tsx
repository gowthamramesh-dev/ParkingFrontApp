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
import ToastManager, { Toast } from "toastify-react-native";
import AccessControl from "@/components/AccessControl";
import { router } from "expo-router";

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
            <Ionicons name="eye-outline" size={22} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleEditPress(item)}>
            <Ionicons name="create-outline" size={22} color="#000" />
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
      <View style={styles.container}>
        <View style={styles.headerBox}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.push("/(protected)/(tabs)/staffPage")}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Staff Details</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#ffcd01" />
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
        <Modal visible={isModalVisible} animationType="fade" transparent>
          {renderBlurWrapper(
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Edit Staff Details</Text>
              <TextInput
                value={editUsername}
                onChangeText={setEditUsername}
                placeholder="Username"
                placeholderTextColor="#888"
                style={styles.input}
              />
              <View style={styles.passwordWrapper}>
                <TextInput
                  value={editPassword}
                  onChangeText={setEditPassword}
                  placeholderTextColor="#888"
                  placeholder="New Password (optional)"
                  secureTextEntry={!passwordVisible}
                  style={styles.input}
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
                placeholderTextColor="#888"
                style={styles.input}
              />
              <TextInput
                value={buildingLocation}
                onChangeText={setBuildingLocation}
                placeholder="Building Location"
                placeholderTextColor="#888"
                style={styles.input}
              />

              <View style={styles.modalButtons}>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleSaveUpdate} style={styles.saveBtn}>
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
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Staff Credentials</Text>

              <View style={{ gap: 14 }}>
                <View
                  style={[
                    styles.viewRow,
                    {
                      shadowColor: "#000",
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderColor: "#ffcd01",
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.06,
                      shadowRadius: 4,
                      elevation: 6,
                    },
                  ]}
                >
                  <Ionicons
                    name="person-circle-outline"
                    size={22}
                    color="#4B5563"
                  />
                  <View>
                    <Text style={styles.viewLabel}>Username</Text>
                    <Text style={styles.viewValue}>
                      {selectedStaff?.username || "-"}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.viewRowBetween,
                    {
                      shadowColor: "#000",
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderColor: "#ffcd01",
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.06,
                      shadowRadius: 4,
                      elevation: 6,
                    },
                  ]}
                >
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
                      style={{ paddingRight: 10 }}
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
                style={styles.saveBtn}
              >
                <Text style={styles.saveText}>Close</Text>
              </Pressable>
            </View>
          )}
        </Modal>

        <ToastManager />
      </View>
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
  },
  headerBox: {
    backgroundColor: "#f6f6f6",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  viewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
  },
  viewRowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 10,
  },
  viewLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  viewValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  iconActions: {
    flexDirection: "row",
    gap: 16,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  card: {
    backgroundColor: "#FFF8C4",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  actionIcons: {
    flexDirection: "row",
    gap: 16,
  },
  noStaffText: {
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
    marginTop: 40,
  },
  modalBox: {
    backgroundColor: "#f6f6f6",
    borderRadius: 16,
    padding: 20,
    width: "92%",
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "white",
    color: "#000",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderColor: "#FFCD01",
    borderWidth: 1,
  },
  passwordWrapper: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    top: 14,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
  },
  cancelText: {
    color: "#000",
    fontWeight: "600",
  },
  saveBtn: {
    paddingVertical: 10,
    marginTop: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "#FFCD01",
    borderRadius: 8,
  },
  saveText: {
    color: "#000",
    fontWeight: "700",
  },
  androidBlur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 16,
  },
  blurView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
});

export default AllStaffs;
