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
  ScrollView,
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
      Toast.show({
        type: res.success ? "success" : "error",
        text1: res.success ? "Profile image updated" : "Image update failed",
        text2: res.success ? undefined : res.error || "Try again later",
        position: "top",
        visibilityTime: 2000,
      });
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
      });
      setUpdating(false);
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: "error",
        text1: "Password too short",
        text2: "Minimum 6 characters",
        position: "top",
        visibilityTime: 2000,
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

    Toast.show({
      type: result?.success ? "success" : "error",
      text1: result?.success ? "Profile updated successfully" : "Update failed",
      text2: result?.success ? undefined : result?.error || "Try again later",
      position: "top",
      visibilityTime: 2000,
    });

    if (result?.success) setShowModal(false);

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

          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 150,
            }}
            showsVerticalScrollIndicator={false}
          >
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
          </ScrollView>
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
                        <ActivityIndicator size="small" color="#ffcd01" />
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
  container: { flex: 1, backgroundColor: "#fff" },
  innerContainer: { marginHorizontal: 16, gap: 12 },
  headerCard: {
    marginBottom: 16,
    backgroundColor: "#f6f6f6",
    padding: 16,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    flex: 1,
    color: "#000",
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
    borderWidth: 2,
    borderColor: "#ffcd01",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  avatarFallback: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "#ffcd01",
    borderWidth: 4,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 32, fontWeight: "bold", color: "white" },
  uploadText: { fontSize: 12, color: "#444a4b", marginTop: 4 },
  card: {
    backgroundColor: "#f6f6f6",
    padding: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 12, fontWeight: "500", color: "#374151", marginBottom: 4 },
  inputBox: {
    backgroundColor: "white",
    height: 56,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#facc15",
  },
  inputText: { fontSize: 16, color: "#111827" },
  editBtn: {
    backgroundColor: "#ffcd01",
    paddingVertical: 12,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 16,
    elevation: 3,
  },
  editBtnText: { color: "#000", fontSize: 16, fontWeight: "600" },
  logoutBtn: {
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 50,
    alignItems: "center",
    elevation: 3,
  },
  logoutBtnText: { color: "#000", fontSize: 16, fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    backgroundColor: "#f6f6f6",
    padding: 24,
    gap: 16,
    borderRadius: 20,
    width: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    color: "#000",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#facc15",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#000",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelBtn: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  updateBtn: {
    backgroundColor: "#ffcd01",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    flex: 1,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledBtn: { opacity: 0.6 },
  loadingIndicator: { backgroundColor: "white", padding: 8, borderRadius: 100 },
  updateText: { color: "#000", fontSize: 18, fontWeight: "700" },
});

export default Profile;
