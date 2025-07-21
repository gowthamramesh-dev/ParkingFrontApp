import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  StatusBar,
  Animated,
  View,
  Pressable,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { RFValue } from "react-native-responsive-fontsize";
import Ionicons from "react-native-vector-icons/Ionicons";

const ParkingSplashScreen = () => {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;

  const [currentImage, setCurrentImage] = useState(0);
  const screenWidth = Dimensions.get("window").width;

  const images = [
    require("../assets/images/Parking-amico.png"),
    require("../assets/images/Parking-rafiki.png"),
    require("../assets/images/bike parking-amico.png"),
  ];

  const imageContents = [
    {
      title: "Start with Sign Up / Login",
      description:
        "If you’re a new user, create your account. Existing users can log in and manage their parking.",
    },
    {
      title: "Checkin and Checkout Process",
      description:
        "Add price details, then smoothly check-in and check-out your vehicles with ease.",
    },
    {
      title: "Manage Monthly Pass & Staff",
      description:
        "Create and extend monthly passes. Admins can also create multiple staff accounts.",
    },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 5000,
        useNativeDriver: true,
      }),
    ]).start();

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.innerContainer}>
        {/* Top Content */}
        <View style={styles.topContent}>
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.title}>Welcome to ParkEase</Text>
            <Text style={styles.subtitle}>Your Smart Parking Assistant</Text>
          </Animated.View>

          <Animated.Image
            source={images[currentImage]}
            resizeMode="contain"
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                width: screenWidth * 0.75,
                height: screenWidth * 0.75,
              },
            ]}
          />

          <Animated.View
            style={[
              styles.descriptionContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.contentTitle}>
              {imageContents[currentImage].title}
            </Text>
            <Text style={styles.contentDescription}>
              {imageContents[currentImage].description}
            </Text>
          </Animated.View>
        </View>

        {/* Sign up Link */}
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={() => router.push("/login")}
            style={styles.button}
          >
            <Ionicons
              name="person-add"
              size={22}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>Let&apos;s Start</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#58EB82",
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    justifyContent: "space-between",
    alignItems: "center",
  },
  topContent: {
    alignItems: "center",
  },
  textContainer: {
    marginTop: 24,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  title: {
    fontSize: RFValue(22),
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: RFValue(14),
    color: "#fff",
    opacity: 0.9,
    marginBottom: 32,
    textAlign: "center",
  },
  descriptionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  contentTitle: {
    fontSize: RFValue(16),
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  contentDescription: {
    fontSize: RFValue(12),
    color: "#fff",
    opacity: 0.9,
    marginTop: 16,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 60,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: RFValue(14),
    fontWeight: "bold",
  },
});

export default ParkingSplashScreen;
