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
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import userAuthStore from "@/utils/store";
import { useNavigation } from "@react-navigation/native";
import ToastManager, { Toast } from "toastify-react-native";

const CreateStaff = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [buildingLocation, setBuildingLocation] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigation = useNavigation();
  const { createStaff, getAllStaffs, isLoading } = userAuthStore();

  const handleCreateStaff = async () => {
    if (!username || !password || !buildingName || !buildingLocation) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "All fields are required",
        position: "top",
      });
      return;
    }

    const building = { name: buildingName, location: buildingLocation };
    const result = await createStaff(username, password, building);

    if (result.success) {
      await getAllStaffs();
      Toast.show({
        type: "success",
        text1: "Staff Created ✅",
        text2: "The new staff has been added.",
        position: "top",
      });

      setUsername("");
      setPassword("");
      setBuildingName("");
      setBuildingLocation("");
    } else {
      Toast.show({
        type: "error",
        text1: "Failed to Create",
        text2: result.error || "Something went wrong.",
        position: "top",
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerText}>Create Staff</Text>
          </View>

          <Text style={styles.label}>Username</Text>
          <TextInput
            placeholder="Enter username"
            value={username}
            placeholderTextColor="#888"
            onChangeText={setUsername}
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#888"
              placeholder="Enter password"
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Building Name</Text>
          <TextInput
            placeholder="Enter building name (e.g., Building A)"
            value={buildingName}
            placeholderTextColor="#888"
            onChangeText={setBuildingName}
            style={styles.input}
          />

          <Text style={styles.label}>Building Location</Text>
          <TextInput
            placeholder="Enter building location (e.g., Vellore)"
            value={buildingLocation}
            placeholderTextColor="#888"
            onChangeText={setBuildingLocation}
            style={styles.input}
          />

          <TouchableOpacity
            onPress={handleCreateStaff}
            disabled={isLoading}
            style={styles.submitButton}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Staff</Text>
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>
      <ToastManager showCloseIcon={false} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  headerContainer: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: "50%",
    transform: [{ translateY: -14 }],
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  label: {
    fontSize: 18,
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DBEAFE",
    backgroundColor: "#DBEAFE",
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#DBEAFE",
    borderRadius: 4,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  submitButton: {
    backgroundColor: "#22C55E",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
});

export default CreateStaff;
