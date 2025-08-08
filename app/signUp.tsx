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
  Image,
  Dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import userAuthStore from "../utils/store";
import ToastManager, { Toast } from "toastify-react-native";
const screenHeight = Dimensions.get("window").height;

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
    setTimeout(() => {
      return router.replace("/login");
    }, 2000);
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
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.whiteCard}>
              <Image
                source={require("../assets/signupIcon.png")}
                style={{
                  position: "absolute",

                  top: screenHeight * 0.23,
                  width: 400,
                  height: 200,
                  opacity: 0.3,
                  transform: [
                    { translateX: 0 },
                    { translateY: -80 },
                    { rotate: "-20deg" },
                  ],
                  zIndex: -1,
                  resizeMode: "contain",
                }}
              />
              <View
                style={{
                  alignItems: "center",
                  paddingVertical: 20,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 40,
                    fontWeight: 900,
                    color: "#FFC107",
                  }}
                >
                  Parking App
                </Text>
                <Text style={styles.tagline}>Let&apos;s get Started</Text>
              </View>

              <Text style={styles.sectionHeaderText}>Signup</Text>

              {/* Username */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <View style={styles.inputGroup}>
                  <Ionicons name="person-outline" size={20} color="black" />
                  <TextInput
                    placeholder="Username"
                    value={userName}
                    onChangeText={setUserName}
                    placeholderTextColor="#9CA3AF"
                    style={styles.inputText}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputGroup}>
                  <Ionicons name="mail-outline" size={20} color="black" />
                  <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.inputText}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputGroup}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="black"
                  />
                  <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    style={styles.inputText}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="black"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputGroup}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="black"
                  />
                  <TextInput
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    style={styles.inputText}
                  />
                </View>
              </View>
            </View>

            {/* Yellow Bottom Section */}
            <View style={styles.bottomSection}>
              <Text style={styles.loginLinkText}>
                <Link href="/login">Already have an Account? Login</Link>
              </Text>

              <TouchableOpacity style={styles.loginBtn} onPress={handleSignup}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffcd01" />
                ) : (
                  <Text style={styles.loginText}>SignUp</Text>
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
    backgroundColor: "#FFC107",
  },
  scrollContent: {
    flexGrow: 1,
  },
  tagline: {
    fontSize: 24,
    fontWeight: 400,
    color: "#374151",
  },
  whiteCard: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingHorizontal: 20,
    paddingBottom: 40,
    marginBottom: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  sectionHeaderText: {
    fontSize: 28,
    fontWeight: 800,
    color: "#FFC107",
    textAlign: "center",
    marginBottom: 10,
  },
  inputContainer: {
    paddingHorizontal: 30,
    marginBottom: 10,
  },
  inputLabel: {
    marginStart: 10,
    fontSize: 14,
    color: "#374151",
    marginBottom: 5,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe57c",
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputText: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#374151",
  },
  bottomSection: {
    alignItems: "center",
    paddingBottom: 40,
  },
  loginLinkText: {
    fontSize: 16,
    color: "#444a4b",
    marginBottom: 30,
  },
  loginBtn: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: "25%",
    borderRadius: 25,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    minWidth: 150,
  },
  loginText: {
    fontSize: 20,
    color: "#FFC107",
    fontWeight: "600",
  },
});

export default Signup;
