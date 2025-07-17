import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="staffPage"
        options={{
          headerShown: true,
          title: "Account Settings",
          headerTitleAlign: "center",
          headerStyle: {
            paddingTop: 10,
            backgroundColor: "#fff",
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={24}
                color="black"
                style={{ marginLeft: 15 }}
              />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
