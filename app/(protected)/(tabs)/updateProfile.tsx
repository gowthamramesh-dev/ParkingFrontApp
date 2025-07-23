import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import userAuthStore from "../../../utils/store";
import AccessControl from "@/components/AccessControl";

const UpdateProfile = () => {
  const { user, updateProfile } = userAuthStore();
  const router = useRouter();

  const scrollViewRef = useRef<ScrollView>(null);

  const [parsedUser, setParsedUser] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [status, setStatus] = useState<"" | "success" | "error">("");

  useEffect(() => {
    const isMounted = { current: true };

    const loadUser = async () => {
      try {
        let parsed: any = null;
        if (user) {
          parsed = typeof user === "string" ? JSON.parse(user) : user;
        } else {
          const storedUser = await AsyncStorage.getItem("user");
          if (storedUser) parsed = JSON.parse(storedUser);
        }

        if (parsed && isMounted.current) {
          if (parsed?.id && !parsed._id) parsed._id = parsed.id;
          setParsedUser(parsed);
          setUsername(parsed.username || "");
        } else if (isMounted.current) {
          Toast.show({ type: "error", text1: "User not found in storage." });
        }
      } catch (error) {
        if (isMounted.current)
          Toast.show({ type: "error", text1: "Error loading user" });
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    loadUser();

    return () => {
      isMounted.current = false;
    };
  }, [user]);

  const handleUpdate = async () => {
    if (updating) return;
    setUpdating(true);

    if (!parsedUser || !parsedUser._id) {
      setStatus("error");
      Toast.show({ type: "error", text1: "User ID not found" });
      setUpdating(false);
      return;
    }

    if (!username.trim()) {
      setStatus("error");
      Toast.show({ type: "error", text1: "Username is required" });
      setUpdating(false);
      return;
    }

    if (!oldPassword || !newPassword) {
      setStatus("error");
      Toast.show({ type: "error", text1: "Enter both old and new passwords" });
      setUpdating(false);
      return;
    }

    if (oldPassword === newPassword) {
      setStatus("error");
      Toast.show({
        type: "error",
        text1: "New password must be different from old password",
      });
      setUpdating(false);
      return;
    }

    if (newPassword.length < 6) {
      setStatus("error");
      Toast.show({
        type: "error",
        text1: "Password too short",
        text2: "New password must be at least 6 characters",
      });
      setUpdating(false);
      return;
    }

    const result = await updateProfile(
      parsedUser._id,
      username,
      newPassword,
      undefined,
      oldPassword
    );

    if (result?.success) {
      setStatus("success");
      Toast.show({ type: "success", text1: "Profile updated successfully" });

      scrollViewRef.current?.scrollTo({ y: 0, animated: true });

      setOldPassword("");
      setNewPassword("");

      setTimeout(() => router.replace("/profile"), 1500);
    } else {
      setStatus("error");
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: result?.error || "Something went wrong.",
      });
    }

    setUpdating(false);
    setTimeout(() => setStatus(""), 3000);
  };

  const getAvatarImage = () => {
    switch (status) {
      case "success":
        return require("../../../assets/images/success.jpg");
      case "error":
        return require("../../../assets/images/error.jpg");
      default:
        return require("../../../assets/images/avator.jpg");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <AccessControl required="adminUpdate">
      <SafeAreaView style={styles.safeContainer}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={80}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.avatarContainer}>
              <Image source={getAvatarImage()} style={styles.avatarImage} />
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.title}>Update Profile</Text>

              <Text style={styles.label}>Username</Text>
              <TextInput
                placeholder="Enter new username"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
              />

              <Text style={styles.label}>Old Password</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  placeholder="Enter current password"
                  secureTextEntry={!showOldPassword}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  style={styles.flexInput}
                />
                <TouchableOpacity
                  onPress={() => setShowOldPassword(!showOldPassword)}
                  style={styles.iconBtn}
                >
                  <Ionicons
                    name={showOldPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  placeholder="Enter new password"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={styles.flexInput}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.iconBtn}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.updateBtn,
                  updating ? { opacity: 0.6 } : undefined,
                ]}
                onPress={handleUpdate}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.updateBtnText}>Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <Toast />
      </SafeAreaView>
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#d1fae5",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 3,
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dbeafe",
    backgroundColor: "#dbeafe",
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  passwordInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#dbeafe",
    borderRadius: 4,
    marginBottom: 16,
  },
  flexInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  iconBtn: {
    padding: 8,
  },
  updateBtn: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 4,
    alignSelf: "center",
    width: 144,
    alignItems: "center",
  },
  updateBtnText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default UpdateProfile;
