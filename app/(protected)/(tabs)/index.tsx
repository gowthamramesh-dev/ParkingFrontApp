import React, { useState } from "react";
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
import { RFValue } from "react-native-responsive-fontsize";
import AccessControl from "@/components/AccessControl";

LogBox.ignoreAllLogs(false);

ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.log("Global Error:", error.message);
});

const Index = () => {
  const [isCheck, setIsCheck] = useState(true);
  return (
    <AccessControl required="home">
      <StatusBar
        backgroundColor="transparent"
        translucent
        barStyle="dark-content"
      />
      <View style={styles.container}>
        <View>
          <View>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  isCheck ? styles.activeToggle : styles.inactiveToggle,
                ]}
                onPress={() => setIsCheck(true)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    isCheck ? styles.activeText : styles.inactiveText,
                  ]}
                >
                  Check In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !isCheck ? styles.activeToggle : styles.inactiveToggle,
                ]}
                onPress={() => setIsCheck(false)}
              >
                <Text
                  style={[
                    styles.toggleText,
                    !isCheck ? styles.activeText : styles.inactiveText,
                  ]}
                >
                  Check Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {isCheck ? <CheckIn /> : <CheckOut />}
          </ScrollView>
        </View>
      </View>
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    flex: 1,
  },
  headerBox: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  greetingText: {
    fontSize: RFValue(18),
    marginBottom: 20,
    color: "#111827",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 999,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  activeToggle: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },

  inactiveToggle: {
    backgroundColor: "#ffffff",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },

  toggleText: {
    fontSize: RFValue(14),
    color: "#505050",
    fontWeight: "600",
  },
  activeText: {
    color: "#505050",
  },
  inactiveText: {
    color: "#6B7280",
  },
  contentWrapper: {
    paddingTop: 20,
    flex: 1,
  },
});

export default Index;
