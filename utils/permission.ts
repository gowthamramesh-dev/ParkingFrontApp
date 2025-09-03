import { PermissionsAndroid, Platform } from "react-native";

export const handleAndroidPermissions = async () => {
  try {
    if (Platform.OS === "android" && Platform.Version >= 31) {
      // Android 12+ (API 31+)
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, // still needed sometimes
      ]);

      const scanGranted =
        result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
        PermissionsAndroid.RESULTS.GRANTED;
      const connectGranted =
        result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
        PermissionsAndroid.RESULTS.GRANTED;
      const locationGranted =
        result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED;

      if (scanGranted && connectGranted) {
        console.debug(
          "[handleAndroidPermissions] Bluetooth permissions granted ✅"
        );
      } else {
        console.error(
          "[handleAndroidPermissions] Bluetooth permissions denied ❌"
        );
      }

      if (!locationGranted) {
        console.warn(
          "[handleAndroidPermissions] Location permission not granted (may still be required on some devices)."
        );
      }
    } else if (Platform.OS === "android" && Platform.Version >= 23) {
      // Android 6–11
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.debug(
          "[handleAndroidPermissions] Location permission granted ✅"
        );
      } else {
        console.error(
          "[handleAndroidPermissions] Location permission denied ❌"
        );
      }
    }
  } catch (err) {
    console.error(
      "[handleAndroidPermissions] error requesting permissions",
      err
    );
  }
};
