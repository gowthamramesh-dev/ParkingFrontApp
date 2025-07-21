import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, Redirect } from "expo-router";
import userAuthStore from "../utils/store";
import ToastManager, { Toast } from "toastify-react-native";

const Signup = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signup } = userAuthStore();

  const handleSignup = async () => {
    setIsLoading(true);
    const result = await signup(userName, email, password);
    setIsLoading(false);

    if (!result.success) {
      Toast.show({
        type: "error",
        text1: "SignUp Failed",
        text2: result.error || "Invalid credentials",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Signup Successful",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
    }

    return <Redirect href={"/login"} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headingContainer}>
              <Text style={styles.appName}>Parkingz</Text>
              <Text style={styles.tagline}>Let&apos;s get Started.</Text>
            </View>

            <View style={styles.formWrapper}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>SignUp</Text>
              </View>

              {/* Username */}
              <View style={styles.inputGroup}>
                <Text style={styles.floatingLabel}>Username</Text>
                <Ionicons name="person-outline" size={20} color="#6B7280" />
                <TextInput
                  placeholder="Username"
                  value={userName}
                  placeholderTextColor="#888"
                  onChangeText={setUserName}
                  style={styles.inputText}
                />
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.floatingLabel}>Email</Text>
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                <TextInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor="#888"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.inputText}
                />
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.floatingLabel}>Password</Text>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#6B7280"
                />
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="#888"
                  secureTextEntry={!showPassword}
                  style={styles.inputText}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.floatingLabel}>Confirm Password</Text>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#6B7280"
                />
                <TextInput
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholderTextColor="#888"
                  secureTextEntry={!showPassword}
                  style={styles.inputText}
                />
              </View>

              {/* Link to Login */}
              <View style={styles.loginLinkWrapper}>
                <Text style={styles.loginLinkText}>
                  <Link href="/login">Already have an Account? Login</Link>
                </Text>
              </View>

              {/* Signup Button */}
              <TouchableOpacity style={styles.signupBtn} onPress={handleSignup}>
                {isLoading ? (
                  <View style={styles.loader}>
                    <ActivityIndicator size="small" color="#10B981" />
                  </View>
                ) : (
                  <Text style={styles.signupText}>SignUp</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      <ToastManager showCloseIcon={false} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d1fae5",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headingContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  appName: {
    fontSize: 32,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 24,
  },
  formWrapper: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    paddingTop: 20,
    borderRadius: 16,
    gap: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionHeader: {
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeaderText: {
    fontSize: 24,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db", // Tailwind's gray-300
    borderRadius: 12,
    paddingHorizontal: 12,
    position: "relative",
    backgroundColor: "#fff",
  },
  floatingLabel: {
    position: "absolute",
    top: -14,
    left: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    zIndex: 10,
    color: "#374151", // Tailwind gray-800
  },
  inputText: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#1F2937", // Tailwind gray-800
  },
  loginLinkWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  loginLinkText: {
    textDecorationLine: "underline",
  },
  signupBtn: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  signupText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "600",
  },
  loader: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 50,
  },
});

export default Signup;
