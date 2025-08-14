import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import userAuthStore from "@/utils/store";
import ToastManager, { Toast } from "toastify-react-native";
import AccessControl from "@/components/AccessControl";
import { router } from "expo-router";

const CreateStaff = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [buildingLocation, setBuildingLocation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isloading, setIsLoading] = useState(false);

  const { createStaff, getAllStaffs, isLoading } = userAuthStore();

  const handleCreateStaff = async () => {
    setIsLoading(true);
    if (!username || !password || !buildingName || !buildingLocation) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "All fields are required",
        position: "top",
      });
      setIsLoading(false);
      return;
    }
    if (
      /\s/.test(username) ||
      /\s/.test(password) ||
      /\s/.test(buildingName) ||
      /\s/.test(buildingLocation)
    ) {
      Toast.show({
        type: "error",
        text1: "No spaces allowed",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Weak Password",
        text2: "Password must be at least 6 characters long.",
        position: "top",
      });
      setIsLoading(false);
      return;
    }

    const building = { name: buildingName, location: buildingLocation };
    const result = await createStaff(username, password, building);

    if (result.success) {
      await getAllStaffs();
      Toast.show({
        type: "success",
        text1: "Staff Created",
        text2: "The new staff has been added.",
        position: "top",
      });

      setUsername("");
      setPassword("");
      setBuildingName("");
      setBuildingLocation("");
      setIsLoading(false);
    } else {
      Toast.show({
        type: "error",
        text1: "Failed to Create",
        text2: result.error || "Something went wrong.",
        position: "top",
      });
      setIsLoading(false);
    }
  };

  return (
    <AccessControl required="createStaff">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBox}>
          <TouchableOpacity
            onPress={() => router.push("/(protected)/(tabs)/staffPage")}
          >
            <Ionicons name="arrow-back" size={26} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Staff</Text>
          <View style={{ width: 26 }} />
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#999"
            style={styles.input}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Building Name"
            value={buildingName}
            onChangeText={setBuildingName}
            placeholderTextColor="#999"
            style={styles.input}
          />

          <TextInput
            placeholder="Building Location"
            value={buildingLocation}
            onChangeText={setBuildingLocation}
            placeholderTextColor="#999"
            style={styles.input}
          />

          <TouchableOpacity
            onPress={handleCreateStaff}
            disabled={isLoading}
            style={styles.submitButton}
          >
            {isloading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="small" color="#ffcd01" />
              </View>
            ) : (
              <Text style={styles.submitText}>Create Staff</Text>
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>
      <ToastManager showCloseIcon={false} />
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 30,
    flexGrow: 1,
    backgroundColor: "white",
  },
  container: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#f6f6f6",
    marginHorizontal: 20,
  },
  headerBox: {
    backgroundColor: "#f6f6f6",
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  input: {
    backgroundColor: "white",
    color: "#000",
    borderWidth: 1,
    borderColor: "#FFCD01",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  passwordContainer: {
    position: "relative",
    justifyContent: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 18,
  },
  submitButton: {
    backgroundColor: "#FFCD01",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  loader: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 50,
  },
});

export default CreateStaff;
