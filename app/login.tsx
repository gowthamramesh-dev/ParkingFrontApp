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
import userAuthStore from "../utils/store";
import { Link } from "expo-router";
import ToastManager, { Toast } from "toastify-react-native";
import { RFValue } from "react-native-responsive-fontsize";

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const Login = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = userAuthStore();

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
        visibilityTime: 1000,
        autoHide: true,
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Login Successful",
        position: "top",
        visibilityTime: 1000,
        autoHide: true,
      });
    }
  };

  const LoginForm = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="always"
    >
      <Image
        source={require("../assets/login.png")}
        style={{
          width: screenWidth * 0.85,
          height: screenWidth * 0.75,
          alignSelf: "center",
          marginBottom: 20,
        }}
        resizeMode="contain"
      />

      <View style={styles.titleWrapper}>
        <Text style={styles.appTitle}>Parking App</Text>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.formWrapper}>
          <Image
            source={require("../assets/loginCar.png")}
            style={styles.carImage}
            resizeMode="contain"
          />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Login</Text>
          </View>

          {/* Inputs */}
          <View style={{ gap: 30, marginBottom: 15 }}>
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
          </View>

          {/* Signup link and login button */}
          <View style={{ gap: 20, width: "70%", zIndex: 3 }}>
            <View style={styles.linkWrapper}>
              <Text style={styles.linkText}>
                <Link href="/signUp">Don’t have an Account? signup</Link>
              </Text>
            </View>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <View style={styles.loader}>
                  <ActivityIndicator size="small" color="#ffcd01" />
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    paddingBottom: 40,
    paddingTop: 20,
  },
  titleWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  appTitle: {
    fontSize: RFValue(26),
    color: "#333",
    fontWeight: "bold",
  },
  bottomContainer: {
    width: "100%",
    position: "relative",
  },
  formWrapper: {
    width: "100%",
    height: screenHeight * 0.55,
    backgroundColor: "#ffcd01",
    padding: 20,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    alignItems: "center",
    zIndex: 1,
  },
  carImage: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 290,
    height: 150,
    zIndex: 2,
  },
  sectionHeader: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 50,
  },
  sectionHeaderText: {
    fontSize: RFValue(24),
    color: "#333",
    fontWeight: "bold",
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: "90%",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  floatingLabel: {
    position: "absolute",
    top: -25,
    left: 6,
    fontSize: RFValue(14),
    paddingHorizontal: 4,
    color: "#444a4b",
  },
  inputText: {
    flex: 1,
    paddingVertical: 8,
    fontSize: RFValue(14),
    color: "#1F2937",
  },
  linkWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  linkText: {
    textDecorationLine: "none",
    color: "#444a4b",
  },
  loginButton: {
    backgroundColor: "#ffcd01",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 50,
    borderColor: "black",
    borderWidth: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 6,
    zIndex: 3,
  },
  loginButtonText: {
    fontSize: RFValue(16),
    color: "#000",
    fontWeight: "600",
  },
  loader: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 50,
  },
});

export default Login;
