import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import userAuthStore from "../../../utils/store";
import ToastManager, { Toast } from "toastify-react-native";
import { Ionicons } from "@expo/vector-icons";
import AccessControl from "@/components/AccessControl";

const Profile = () => {
  const { user, logOut, updateProfile } = userAuthStore();
  const router = useRouter();

  const parsedUser = useMemo(() => {
    return typeof user === "string" ? JSON.parse(user) : user;
  }, [user]);

  const [avatar, setAvatar] = useState(parsedUser?.profileImage || null);
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState(parsedUser?.username || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (parsedUser?.avatar) {
      setAvatar(parsedUser.avatar);
    }
  }, [parsedUser]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logOut();
          router.replace("/login");
        },
      },
    ]);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show({
        type: "error",
        text1: "Permission required",
        text2: "Please allow access to your media library",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      base64: true,
    });

    if (!result.canceled) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setAvatar(base64Image);

      const res = await updateProfile(
        parsedUser._id,
        parsedUser.username,
        "",
        base64Image,
        ""
      );
      if (res.success) {
        Toast.show({
          type: "success",
          text1: "Profile image updated",
          position: "top",
          visibilityTime: 2000,
          autoHide: true,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Image update failed",
          text2: res.error || "Try again later",
          position: "top",
          visibilityTime: 2000,
          autoHide: true,
        });
      }
    }
  };

  const handleUpdate = async () => {
    if (updating) return;
    setUpdating(true);

    if (!username.trim() || !oldPassword || !newPassword) {
      Toast.show({
        type: "error",
        text1: "All fields are required",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
      setUpdating(false);
      return;
    }

    if (oldPassword === newPassword) {
      Toast.show({
        type: "error",
        text1: "New password must be different",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
      setUpdating(false);
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Password too short",
        text2: "New password must be at least 6 characters",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
      setUpdating(false);
      return;
    }

    const result = await updateProfile(
      parsedUser._id,
      username,
      newPassword,
      avatar,
      oldPassword
    );

    if (result?.success) {
      Toast.show({
        type: "success",
        text1: "Profile updated successfully",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
      setShowModal(false);
    } else {
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: result?.error || "Try again later",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
    }

    setUpdating(false);
    setOldPassword("");
    setNewPassword("");
  };

  return (
    <AccessControl required="account">
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          <View style={styles.headerCard}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={() => router.push("/(protected)/(tabs)/profile")}
              >
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Profile Settings</Text>
              <View style={{ width: 24 }} />
            </View>
          </View>

          <View>
            <View style={styles.avatarContainer}>
              <TouchableOpacity
                onPress={pickImage}
                style={styles.centeredItems}
              >
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitial}>I</Text>
                  </View>
                )}
                <Text style={styles.uploadText}>
                  Click to upload a new photo
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <View style={styles.inputBox}>
                  <Text style={styles.inputText}>{parsedUser?.username}</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputBox}>
                  <Text style={styles.inputText}>{parsedUser?.email}</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setShowModal(true)}
                style={styles.editBtn}
              >
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                <Text style={styles.logoutBtnText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {showModal && (
          <Modal visible={showModal} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Update Profile</Text>

                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  style={styles.modalInput}
                  placeholderTextColor="#888"
                  placeholder="Enter new username"
                />
                <TextInput
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry
                  placeholderTextColor="#888"
                  style={styles.modalInput}
                  placeholder="Enter old password"
                />
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholderTextColor="#888"
                  style={styles.modalInput}
                  placeholder="Enter new password"
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setShowModal(false)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.updateBtn, updating && styles.disabledBtn]}
                    disabled={updating}
                    onPress={handleUpdate}
                  >
                    {updating ? (
                      <View style={styles.loadingIndicator}>
                        <ActivityIndicator size="small" color="#10B981" />
                      </View>
                    ) : (
                      <Text style={styles.updateText}>Update</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        <ToastManager showCloseIcon={false} />
      </View>
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  innerContainer: { margin: 16, gap: 12 },
  headerCard: {
    backgroundColor: "white",
    paddingVertical: 16,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
  },
  avatarContainer: {
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 8,
  },
  centeredItems: { alignItems: "center" },
  avatarImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  avatarFallback: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "#34D399",
    borderWidth: 4,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 32, fontWeight: "bold", color: "white" },
  uploadText: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  card: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 12, fontWeight: "500", color: "#374151", marginBottom: 4 },
  inputBox: {
    backgroundColor: "#DBEAFE",
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  inputText: { fontSize: 16, color: "#111827" },
  editBtn: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 16,
  },
  editBtnText: { color: "black", fontSize: 16, fontWeight: "500" },
  logoutBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  logoutBtnText: { color: "black", fontSize: 16, fontWeight: "600" },
  centeredViewWhite: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
  },
  accessDeniedText: { color: "#EF4444", fontSize: 20, fontWeight: "bold" },
  subText: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    backgroundColor: "white",
    padding: 20,
    gap: 12,
    borderRadius: 4,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#DBEAFE",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
  },
  cancelText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  updateBtn: {
    backgroundColor: "#059669",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    flex: 1,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledBtn: { opacity: 0.6 },
  loadingIndicator: { backgroundColor: "white", padding: 8, borderRadius: 100 },
  updateText: { color: "white", fontSize: 18, fontWeight: "600" },
});

export default Profile;
