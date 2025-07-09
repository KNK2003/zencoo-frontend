import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../navigation/types"; 
import { styles } from "../../styles/myProfileStyles";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosInstance";

interface EditProfileModalProps {
  visible: boolean;
  profile: any;
  onClose: () => void;
  onSave: (updated: any) => Promise<void>;
  usernameLastChanged: Date | null;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  profile,
  onClose,
  onSave,
  usernameLastChanged,
}) => {
  // FIX: type your navigation instance
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { setIsAuthenticated } = useAuth();

  const [form, setForm] = useState({
    displayName: profile.displayName,
    username: profile.username,
    door: profile.door,
    email: profile.email,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [usernameWarning, setUsernameWarning] = useState(false);

  function isValid() {
    if (!form.displayName.trim()) return false;
    if (!/^\d{4}$/.test(form.door)) return false;
    if (form.username.trim().length < 3) return false;
    return (
      form.displayName !== profile.displayName ||
      form.username !== profile.username ||
      form.door !== profile.door
    );
  }

  async function handleSave() {
    setSaving(true);
    setErrors({});
    if (!form.displayName.trim()) {
      setErrors({ displayName: "Display name cannot be empty." });
      setSaving(false);
      return;
    }
    if (!/^\d{4}$/.test(form.door)) {
      setErrors({ door: "Door number must be 4 digits." });
      setSaving(false);
      return;
    }
    if (form.username.trim().length < 3) {
      setErrors({ username: "Username must be at least 3 characters." });
      setSaving(false);
      return;
    }
    if (form.username !== profile.username && !usernameWarning) {
      setUsernameWarning(true);
      setSaving(false);
      return;
    }
    try {
      await onSave(form);
      onClose();
    } catch (e: any) {
      setErrors({ general: e.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      // 1. Call backend to update lastLogoutTime using Axios instance
      await api.post("/auth/logout");
      // 2. Clear auth/session (replace with your logic)
      setIsAuthenticated(false); // <-- This triggers the login screen
    } catch (e: any) {
      Alert.alert(
        "Logout Failed",
        e.message || "Could not log out. Please try again."
      );
    }
  }

  function confirmLogout() {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Yes", style: "destructive", onPress: handleLogout },
    ]);
  }

  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.25)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 100,
      }}
    >
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 18,
          padding: 24,
          width: "90%",
          maxWidth: 400,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 16 }}>
          Edit Profile
        </Text>
        <Text style={{ fontWeight: "600", marginBottom: 4 }}>Display Name</Text>
        <TextInput
          style={[styles.editableFieldInput, { marginBottom: 8 }]}
          value={form.displayName}
          onChangeText={(v) => setForm((e) => ({ ...e, displayName: v }))}
          placeholder="Display Name"
        />
        <Text style={{ fontWeight: "600", marginBottom: 4 }}>Username</Text>
        <TextInput
          style={[styles.editableFieldInput, { marginBottom: 8 }]}
          value={form.username}
          onChangeText={(v) =>
            setForm((e) => ({ ...e, username: v.replace(/^@/, "") }))
          }
          placeholder="Username"
          editable={
            !usernameLastChanged ||
            (Date.now() - new Date(usernameLastChanged).getTime()) /
              (1000 * 60 * 60 * 24) >=
              14
          }
        />
        {usernameWarning && (
          <Text style={{ color: "#E67E22", marginBottom: 8 }}>
            Changing your username may affect how others find you.
          </Text>
        )}
        <Text style={{ fontWeight: "600", marginBottom: 4 }}>Door Number</Text>
        <TextInput
          style={[styles.editableFieldInput, { marginBottom: 8 }]}
          value={form.door}
          onChangeText={(v) => setForm((e) => ({ ...e, door: v }))}
          placeholder="Door Number (4 digits)"
          keyboardType="numeric"
          maxLength={4}
        />
        <Text style={{ fontWeight: "600", marginBottom: 4 }}>Email</Text>
        <TextInput
          style={[
            styles.editableFieldInput,
            { marginBottom: 16, backgroundColor: "#f0f0f0" },
          ]}
          value={form.email}
          editable={false}
        />
        {Object.values(errors).map((err, i) => (
          <Text key={i} style={{ color: "#e74c3c", marginBottom: 4 }}>
            {String(err)}
          </Text>
        ))}
        <View
          style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}
        >
          <TouchableOpacity
            style={[styles.editableFieldCancelBtn, { minWidth: 80 }]}
            onPress={onClose}
            disabled={saving}
          >
            <Text style={styles.editableFieldCancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.editableFieldSaveBtn,
              (!isValid() || saving) && styles.editableFieldSaveBtnDisabled,
              { minWidth: 80 },
            ]}
            onPress={handleSave}
            disabled={!isValid() || saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.editableFieldSaveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
        {/* Add note and logout button */}
        <Text
          style={{
            color: "#888",
            fontSize: 12,
            marginTop: 24,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          You can log in again anytime using your registered email.
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 4,
            paddingVertical: 12,
            alignItems: "center",
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#e74c3c",
            backgroundColor: "#fff",
          }}
          onPress={confirmLogout}
        >
          <Text style={{ color: "#e74c3c", fontWeight: "bold" }}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditProfileModal;
