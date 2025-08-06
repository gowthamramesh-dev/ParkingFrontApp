import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  StatusBar,
  Animated,
  View,
  Pressable,
  Dimensions,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { RFValue } from "react-native-responsive-fontsize";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <SafeAreaView style={styles.container}>
      <Image
        source={require("../assets/loIcon.png")}
        style={{
          position: "absolute",
          right: -50,
          top: 100,
          width: 100,
          height: 160,
          opacity: 0.3,
          zIndex: -1,
        }}
      />
      <Image
        source={require("../assets/toloIcon.png")}
        style={{
          position: "absolute",
          bottom: 40,
          width: 400,
          transform: [
            { translateX: 0 },
            { translateY: -80 },
            { rotate: "-30deg" },
          ],
          height: 80,
          opacity: 0.3,
          zIndex: -1,
        }}
      />

      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.innerContainer}>
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Welcome to Parking App</Text>
          <Text style={styles.subtitle}>Your Smart Parking Assistant</Text>
        </Animated.View>

        <Animated.Image
          source={images[currentImage]}
          resizeMode="contain"
          style={[
            styles.image,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
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

        <View style={styles.buttonWrapper}>
          <Pressable
            onPress={() => router.push("/login")}
            style={styles.button}
          >
            <Ionicons
              name="person-add"
              size={20}
              color="#000"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>Let&apos;s Start</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: RFValue(20),
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: RFValue(12),
    color: "#666",
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: Dimensions.get("window").width * 0.75,
  },
  descriptionContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  contentTitle: {
    fontSize: RFValue(14),
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  contentDescription: {
    fontSize: RFValue(12),
    color: "#333",
    textAlign: "center",
    marginTop: 10,
  },
  buttonWrapper: {
    width: "100%",
    alignItems: "center",
    marginTop: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "85%",
    backgroundColor: "#ffcd01",
    borderRadius: 40,
    paddingVertical: 12,
    paddingHorizontal: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    fontSize: RFValue(14),
    color: "#000",
    fontWeight: "bold",
  },
});

export default ParkingSplashScreen;
