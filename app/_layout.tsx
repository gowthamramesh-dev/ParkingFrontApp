import { useEffect } from "react";
import { Stack } from "expo-router";
import { jwtDecode } from "jwt-decode";
import userAuthStore from "@/utils/store";
import { ActivityIndicator, View, Text, TextInput } from "react-native";

if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.allowFontScaling = false;

if (TextInput.defaultProps == null) TextInput.defaultProps = {};
TextInput.defaultProps.allowFontScaling = false;

export default function RootLayout() {
  // Extract state using selectors (avoids unnecessary renders)
  const isLogged = userAuthStore((state) => state.isLogged);
  const hydrated = userAuthStore((state) => state.hydrated);
  const token = userAuthStore((state) => state.token);
  const logOut = userAuthStore((state) => state.logOut);

  // Restore session only once on mount
  useEffect(() => {
    userAuthStore.getState().restoreSession();
  }, []);

  // Validate token expiration after hydration
  useEffect(() => {
    if (hydrated && token) {
      try {
        const decoded: { exp?: number } = jwtDecode(token);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          logOut(); // Auto logout if token expired
        }
      } catch (err) {
        console.warn("❌ Invalid token, logging out:", err);
        logOut(); // Token is invalid or corrupted
      }
    }
  }, [hydrated, token]);

  // Show nothing until session is restored
  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="lightgreen" />
      </View>
    );
  }
  return (
    <Stack>
      <Stack.Protected guard={isLogged}>
        <Stack.Screen
          name="(protected)/(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(protected)/(staff)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="listPage"
          options={{
            headerShown: false,
          }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!isLogged}>
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signUp" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
