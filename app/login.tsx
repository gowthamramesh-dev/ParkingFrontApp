import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import userAuthStore from "../utils/store";
import { Link } from "expo-router";
import ToastManager, { Toast } from "toastify-react-native";

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = userAuthStore();

  const screenWidth = Dimensions.get("window").width;

  const handleLogin = async () => {
    setIsLoading(true);
    const result = await login(userName, password);
    setIsLoading(false);
    if (!result.success) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: result.error || "Invalid credentials",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Login Successful",
        position: "top",
        visibilityTime: 2000,
        autoHide: true,
      });
    }
  };

  const LoginForm = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Image
        source={require("../assets/login.png")}
        style={{
          width: screenWidth * 0.85,
          height: screenWidth * 0.9,
        }}
        resizeMode="cover"
      />
      <View style={styles.titleWrapper}>
        <Text style={styles.appTitle}>Parkingz</Text>
      </View>

      <View style={styles.formWrapper}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>Login</Text>
        </View>

        {/* Username */}
        <View style={styles.inputGroup}>
          <Text style={styles.floatingLabel}>Username</Text>
          <Ionicons name="person-outline" size={20} color="#6B7280" />
          <TextInput
            placeholder="Username"
            value={userName}
            onChangeText={setUserName}
            style={styles.inputText}
            placeholderTextColor="#888"
          />
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.floatingLabel}>Password</Text>
          <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#888"
            secureTextEntry={!showPassword}
            style={styles.inputText}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        {/* Signup Link */}
        <View style={styles.linkWrapper}>
          <Text style={styles.linkText}>
            <Link href="/signUp">Don’t have an Account? signup</Link>
          </Text>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          {isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="small" color="#10B981" />
            </View>
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS !== "web" ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
          >
            {LoginForm()}
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      ) : (
        <View style={{ flex: 1 }}>{LoginForm()}</View>
      )}
      <ToastManager showCloseIcon={false} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d1fae5",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  titleWrapper: {
    alignItems: "center",
    gap: 4,
  },
  appTitle: {
    fontSize: 32,
    marginBottom: 12,
  },
  formWrapper: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    paddingTop: 20,
    borderRadius: 16,
    marginTop: 20,
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
    borderColor: "#d1d5db", // Tailwind gray-300
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
    color: "#374151", // Tailwind gray-700
  },
  inputText: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#1F2937", // Tailwind gray-800
  },
  linkWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  linkText: {
    textDecorationLine: "underline",
  },
  loginButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
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

export default Login;
