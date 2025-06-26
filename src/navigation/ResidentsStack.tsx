import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Wing from "../screens/residents/wings/Wing";
import Residents from "../screens/residents/Residents";
import OthersProfileScreen from "../screens/userProfile/OthersProfile";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type ResidentsStackParamList = {
  Wing: undefined;
  ResidentsList: { wing: { label: string; value: string } };
  OthersProfile: {
    id: string;
    displayName: string;
    username: string;
    wing: string;
    door: string;
  }; // <-- FIXED
};

const Stack = createNativeStackNavigator<ResidentsStackParamList>();

// Move this wrapper ABOVE ResidentsStack
const WingScreenWrapper = ({
  navigation,
}: NativeStackScreenProps<ResidentsStackParamList, "Wing">) => {
  return (
    <Wing
      onSelectWing={(wing) => navigation.navigate("ResidentsList", { wing })}
      bottomPadding={64}
    />
  );
};

const ResidentsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Wing" component={WingScreenWrapper} />
    <Stack.Screen name="ResidentsList" component={Residents} />
    <Stack.Screen name="OthersProfile" component={OthersProfileScreen} />
  </Stack.Navigator>
);

export default ResidentsStack;
