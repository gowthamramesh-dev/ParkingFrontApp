import React from "react";
import { View, Text, StyleSheet } from "react-native";
import useAuthStore from "../utils/store";

const AccessControl = ({
  required,
  children,
}: {
  required: string;
  children: React.ReactNode;
}) => {
  const { staffPermission, role } = useAuthStore();

  const isStaff = role === "staff";
  const isAllowed = staffPermission.includes(required);

  if (isStaff && !isAllowed) {
    return (
      <View style={styles.accessDeniedContainer}>
        <Text style={styles.accessDeniedTitle}>Access Denied</Text>
        <Text style={styles.accessDeniedSubtitle}>
          You are not authorized to view this page.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

export default AccessControl;

const styles = StyleSheet.create({
  accessDeniedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ef4444",
  },
  accessDeniedSubtitle: {
    marginTop: 8,
    color: "#4B5563",
    textAlign: "center",
  },
});
