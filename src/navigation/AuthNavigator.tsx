import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomePage from "../screens/userAuth/WelcomePage";
import SignUpStepOne from "../screens/userAuth/SignUpStepOne";
import SignUpStepTwo from "../screens/userAuth/SignUpStepTwo";
import SignUpStepThree from "../screens/userAuth/SignUpstepThree";
import Login from "../screens/userAuth/Login";
import AppNavigator from "./AppNavigator";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AppNavigator />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="WelcomePage" component={WelcomePage} />
          <Stack.Screen
            name="SignUpStepOne"
            component={SignUpStepOne}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="SignUpStepTwo" component={SignUpStepTwo} />
          <Stack.Screen name="SignUpStepThree">
            {(props) => (
              <SignUpStepThree
                {...props}
                onAuthSuccess={() => setIsAuthenticated(true)}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Login">
            {(props) => (
              <Login
                {...props}
                onAuthSuccess={() => setIsAuthenticated(true)}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
