import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
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

    console.log(selected);
    Toast.show({
      type: "success",
      text1: "Permission Saved",
      text2: `${selected}`,
      position: "top",
      visibilityTime: 1000,
      autoHide: true,
    });
  };

  return (
    <AccessControl required="staffPermissionPage">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Assign Permissions</Text>

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
              color={selected.includes(permission) ? "#10B981" : undefined}
            />
            <Text style={styles.permissionText}>{permission}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Save Permissions</Text>
        </TouchableOpacity>
      </ScrollView>
    </AccessControl>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    backgroundColor: "#F9FAFB",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#047857",
    marginBottom: 12,
  },
  permissionItem: {
    backgroundColor: "#ffffff",
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
    borderColor: "#10B981",
    backgroundColor: "#d1fae5",
  },
  permissionText: {
    fontSize: 18,
    color: "#064e3b",
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PermissionPage;
