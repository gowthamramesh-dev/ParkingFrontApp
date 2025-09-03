import React, { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Checkbox from "expo-checkbox";
import userAuthStore from "../../../utils/store";
import { Toast } from "toastify-react-native";
import AccessControl from "@/components/AccessControl";

const permissionList = [
  "home",
  "vehicles",
  "todayReport",
  "monthlyPass",
  "accountSettings",
  "dashboard",
  "account",
  "priceDetails",
  "staffSettings",
  "edit/DeleteStaff",
  "createStaff",
  "ViewStaff",
  "InStaff",
  "staffDetails",
  "staffVehicles",
  "staffRevenue",
  "staffPermissionPage",
  "adminUpdate",
  "printerSettings",
];

const PermissionPage = (id: any) => {
  const [selected, setSelected] = useState<string[]>([]);
  const { setStaffPermission, permissions } = userAuthStore();

  useEffect(() => {
    if (permissions && Array.isArray(permissions)) {
      setSelected(permissions);
    }
  }, [permissions]);

  const togglePermission = (permission: string) => {
    setSelected((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSubmit = async () => {
    const result = await setStaffPermission(id.id, selected);
    if (!result.success) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Error in setting the permission",
        position: "top",
        visibilityTime: 1000,
        autoHide: true,
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "Permissions Saved",
      text2: "Permissions updated successfully",
      position: "top",
      visibilityTime: 1000,
      autoHide: true,
    });
  };

  return (
    <AccessControl required="staffPermissionPage">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Staff Permissions</Text>

        <View style={styles.listWrapper}>
          {permissionList.map((permission) => (
            <TouchableOpacity
              key={permission}
              onPress={() => togglePermission(permission)}
              style={[
                styles.permissionItem,
                selected.includes(permission) && styles.permissionItemActive,
              ]}
            >
              <Checkbox
                value={selected.includes(permission)}
                onValueChange={() => togglePermission(permission)}
                color={selected.includes(permission) ? "#ffcd01" : undefined}
              />
              <Text style={styles.permissionText}>{permission}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Save Permissions</Text>
        </TouchableOpacity>
      </ScrollView>
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
    textAlign: "center",
  },
  listWrapper: {
    gap: 12,
  },
  permissionItem: {
    backgroundColor: "#f6f6f6",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  permissionItemActive: {
    borderColor: "#ffcd01",
    backgroundColor: "#fff7cc",
  },
  permissionText: {
    fontSize: 16,
    color: "#111",
    fontWeight: "500",
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: "#ffcd01",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});

export default PermissionPage;
