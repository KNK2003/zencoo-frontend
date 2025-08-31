import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MyProfileScreen from "../screens/userProfile/MyProfile";
import FriendsListScreen from "../screens/friends/FriendsListScreen";
import FriendRequestsInboxScreen from "../screens/friends/FriendRequestsInboxScreen";

export type ProfileStackParamList = {
  MyProfile: undefined;
  FriendsListScreen: { userId: string };
  FriendRequestsInboxScreen: { userId: string };
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MyProfile" component={MyProfileScreen} />
    <Stack.Screen name="FriendsListScreen" component={FriendsListScreen} />
    <Stack.Screen
      name="FriendRequestsInboxScreen"
      component={FriendRequestsInboxScreen}
    />
  </Stack.Navigator>
);

export default ProfileStack;
