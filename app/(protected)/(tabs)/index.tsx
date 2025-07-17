import React, { useEffect, useState } from "react";
import "../../global.css";
import {
  StatusBar,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  LogBox,
  StyleSheet,
} from "react-native";
import CheckIn from "@/components/CheckIn";
import CheckOut from "@/components/CheckOut";
import AsyncStorage from "@react-native-async-storage/async-storage";

LogBox.ignoreAllLogs(false);

ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.log("❌ Global Error:", error.message);
});

const Index = () => {
  const [isCheck, setIsCheck] = useState(true);
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    fetchUser();
  }, []);

  return (
    <>
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="dark-content"
      />
      <View style={styles.container}>
        <View>
          <View style={styles.headerBox}>
            <Text style={styles.greetingText}>Hey {user?.username},</Text>

            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={styles.checkInButton}
                onPress={() => setIsCheck(true)}
              >
                <Text style={styles.toggleText}>Check In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.checkOutButton}
                onPress={() => setIsCheck(false)}
              >
                <Text style={styles.toggleText}>Check Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.contentWrapper}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {isCheck ? <CheckIn /> : <CheckOut />}
          </ScrollView>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 16,
    paddingHorizontal: 16,
    flex: 1,
  },
  headerBox: {
    borderWidth: 1,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderRadius: 4,
    backgroundColor: "white",
    padding: 8,
  },
  greetingText: {
    fontSize: 24,
    marginBottom: 20,
    color: "#111827",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  checkInButton: {
    backgroundColor: "#4ade80",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 4,
  },
  checkOutButton: {
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 4,
  },
  toggleText: {
    fontSize: 20,
    color: "#ffffff",
  },
  contentWrapper: {
    paddingTop: 20,
    flex: 1,
  },
});

export default Index;
