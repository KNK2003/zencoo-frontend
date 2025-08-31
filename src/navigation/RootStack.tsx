import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppNavigator from "./AppNavigator";
import FriendRequestsInboxScreen from "../screens/friends/FriendRequestsInboxScreen";

export type RootStackParamList = {
  Main: undefined;
  FriendRequestsInboxScreen: { userId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main" component={AppNavigator} />
    <Stack.Screen name="FriendRequestsInboxScreen" component={FriendRequestsInboxScreen} />
  </Stack.Navigator>
);

export default RootStack;