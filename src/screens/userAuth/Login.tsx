import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import styles from "../../styles/loginStyles";
import axios from "axios";
import { saveJWT } from "../../utils/secureStore";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Required"),
});

export default function Login({ navigation, onAuthSuccess }: any) {
  const [focusedInput, setFocusedInput] = useState<"email" | "password" | null>(
    null
  );

  // Helper function to check credentials using backend API
  const loginUser = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email,
          password,
        }
      );
      if (response.status === 200) {
        await saveJWT(response.data.token);
        return { success: true, message: response.data.message, token: response.data.token };
      } else {
        return {
          success: false,
          error: response.data.message || "Login failed",
        };
      }
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        return { success: false, error: "Invalid email or password" };
      }
      return { success: false, error: "Network error. Please try again." };
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../assets/images/zencoo.png")}
          style={{ width: 210, height: 70, resizeMode: "contain" }}
        />
      </View>

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          setSubmitting(true);
          const result = await loginUser(values.email, values.password);
          setSubmitting(false);
          if (!result.success) {
            setErrors({ email: result.error });
            return;
          }
          if (typeof onAuthSuccess === "function") onAuthSuccess();
          console.log("Login successful");
          console.log("JWT token generated:", result.token);
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isSubmitting,
        }) => (
          <>
            <TextInput
              placeholder="Enter your email"
              style={[
                styles.input,
                focusedInput === "email" && styles.inputFocused,
              ]}
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={(e) => {
                handleBlur("email")(e);
                setFocusedInput(null);
              }}
              onFocus={() => setFocusedInput("email")}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#888"
            />
            {touched.email && errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
            <TextInput
              placeholder="Enter your password"
              style={[
                styles.input,
                focusedInput === "password" && styles.inputFocused,
              ]}
              value={values.password}
              onChangeText={handleChange("password")}
              onBlur={(e) => {
                handleBlur("password")(e);
                setFocusedInput(null);
              }}
              onFocus={() => setFocusedInput("password")}
              secureTextEntry
              placeholderTextColor="#888"
            />
            {touched.password && errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit as any}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Log In</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </Formik>

      {/* Google Login Button */}
      {/*
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#4285F4" }]}
        onPress={() => {
          setIsGoogleLoading(true);
          promptAsync();
        }}
        disabled={isGoogleLoading || !request}
      >
        {isGoogleLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue with Google</Text>
        )}
      </TouchableOpacity>
      */}
      {/* Bottom Text */}
      <View style={styles.bottomTextContainer}>
        <Text style={styles.bottomText}>
          Don't have an account?{" "}
          <Text
            style={styles.bottomTextBold}
            onPress={() =>
              navigation && navigation.navigate
                ? navigation.navigate("SignUpStepOne")
                : null
            }
          >
            Sign up.
          </Text>
        </Text>
      </View>
    </View>
  );
}
