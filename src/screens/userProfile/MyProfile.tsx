import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { styles } from "../../styles/myProfileStyles";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/types";
import { useProfileImageUpload } from "../../hooks/useProfileImageUpload";

const profilePic = require("../../../assets/images/profile-placeholder.jpg");
const imageMap: { [key: string]: any } = {
  "../../../assets/images/pulses.jpg": require("../../../assets/images/pulses.jpg"),
  "../../../assets/images/veggies (2).jpg": require("../../../assets/images/veggies (2).jpg"),
  "../../../assets/images/dates.jpg": require("../../../assets/images/dates.jpg"),
  "../../../assets/images/profile-placeholder.jpg": profilePic,
};

// 1. Define a Profile type
type Profile = {
  id: string;
  username: string; // unique handle, e.g. "janhvi_kapoor"
  displayName: string; // normal name, e.g. "Janhvi Kapoor"
  wing: string;
  door: string;
  bio: string;
  hometown: string;
  profilePic: string;
  headerBg: string | null;
  friends: number;
  posts: string[];
};

const useProfile = (navigation: any) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const localData = require("../../data/myProfile.json");
        const token = await SecureStore.getItemAsync("jwt");
        if (!token)
          return setError("You are not logged in."), setProfile(localData);
        const res = await fetch("http://localhost:8080/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok)
          return setError("Failed to fetch profile."), setProfile(localData);
        const data = await res.json();
        setProfile({
          ...localData,
          id: String(data.id),
          username: data.username,
          displayName: data.fullName,
          wing: data.doorNumber ? String(data.doorNumber)[0] : "",
          door: data.doorNumber,
          bio: data.bio ?? localData.bio,
          hometown: data.hometown ?? localData.hometown,
        });
        setError(null);
      } catch {
        setError("An error occurred loading your profile.");
        setProfile(require("../../data/myProfile.json"));
      }
    })();
  }, [navigation]);
  return { profile, setProfile, error, setError };
};

const EditableField = ({
  value,
  editing,
  inputValue,
  setInputValue,
  onSave,
  onCancel,
  saving,
  placeholder,
  icon,
  multiline,
  maxLength,
}: any) =>
  editing ? (
    <View style={{ width: "100%" }}>
      <TextInput
        style={[
          styles.editableFieldInput,
          multiline
            ? styles.editableFieldInputMultiline
            : styles.editableFieldInputSingle,
        ]}
        value={inputValue}
        onChangeText={setInputValue}
        placeholder={placeholder}
        multiline={multiline}
        maxLength={maxLength}
        editable={!saving}
      />
      {maxLength && (
        <Text style={styles.editableFieldCounter}>
          {inputValue.length}/{maxLength}
        </Text>
      )}
      <View style={styles.editableFieldBtnRow}>
        <TouchableOpacity
          onPress={onCancel}
          style={styles.editableFieldCancelBtn}
          disabled={saving}
        >
          <Text style={styles.editableFieldCancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSave}
          style={[
            styles.editableFieldSaveBtn,
            saving && styles.editableFieldSaveBtnDisabled,
          ]}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.editableFieldSaveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <TouchableOpacity
      style={styles.editableFieldRow}
      onPress={() => setInputValue(value)}
      activeOpacity={0.7}
    >
      {icon}
      <View>
        {value ? (
          <Text style={styles.bioText}>{value}</Text>
        ) : (
          <>
            <Text style={styles.bioTitle}>Add {placeholder}</Text>
            <Text style={styles.bioSubtitle}>Tell others about yourself</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

const MyProfileScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { profile, setProfile } = useProfile(navigation);
  const insets = useSafeAreaInsets();
  const [editMode, setEditMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [bioState, setBioState] = useState({
    editing: false,
    input: "",
    saving: false,
  });
  const [hometownState, setHometownState] = useState({
    editing: false,
    input: "",
    saving: false,
  });

  // When profile changes, update bioInput if not editing
  useEffect(() => {
    if (profile && !bioState.editing)
      setBioState((s) => ({ ...s, input: profile.bio || "" }));
  }, [profile, bioState.editing]);

  // When profile changes, update hometownInput if not editing
  useEffect(() => {
    if (profile && !hometownState.editing)
      setHometownState((s) => ({ ...s, input: profile.hometown || "" }));
  }, [profile, hometownState.editing]);

  const saveField = useCallback(
    async (field: "bio" | "hometown", value: string, setState: any) => {
      if (!profile) return;
      setState((s: any) => ({ ...s, saving: true }));
      try {
        const token = await SecureStore.getItemAsync("jwt");
        const res = await fetch(`http://localhost:8080/api/profile/${field}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ [field]: value }),
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProfile((prev: any) =>
          prev ? { ...prev, [field]: data[field] } : prev
        );
        setState((s: any) => ({ ...s, editing: false }));
      } catch {
        alert(`Failed to save ${field}. Please try again.`);
      } finally {
        setState((s: any) => ({ ...s, saving: false }));
      }
    },
    [profile, setProfile]
  );

  // Pick image from gallery
  const pickHeaderImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // fixed here
      allowsEditing: true,
      aspect: [3, 2],
      quality: 1,
    });
    if (!result.canceled && result.assets?.length)
      setProfile((prev: any) =>
        prev ? { ...prev, headerBg: result.assets[0].uri } : null
      );
  };

  // Pick profile image from gallery
  const pickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // updated here
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    // setProfilePic(result.assets[0].uri); // implement as needed
  };

  // Toggle post selection
  const toggleSelectPost = (idx: number) =>
    setSelectedPosts((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );

  // Delete selected posts with confirmation
  const handleDeletePosts = () => {
    if (!selectedPosts.length) return;
    if (
      window.confirm
        ? window.confirm("Are you sure you want to delete the selected posts?")
        : true
    ) {
      // Remove selected posts
      // setPosts(profile.posts.filter((_, idx) => !selectedPosts.includes(idx)));
      setSelectedPosts([]);
      setEditMode(false);
    }
  };

  // 👇 Always call hooks before any early return!
  const { uploading, pickAndUpload } = useProfileImageUpload(async (url) => {
    setProfile((prev) => (prev ? { ...prev, profilePic: url } : prev));
    try {
      const token = await SecureStore.getItemAsync("jwt");
      await fetch("http://localhost:8080/api/profile/profile-pic", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profilePic: url }),
      });
    } catch {
      Alert.alert("Failed to save profile picture to backend.");
    }
  });

  if (!profile) return null; // or a loading spinner

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with background image, back button, and camera icon */}
        <ImageBackground
          source={profile.headerBg ? { uri: profile.headerBg } : undefined}
          style={[styles.header, { paddingTop: insets.top }]}
          imageStyle={styles.headerBgImage}
        >
          <View style={styles.overlay} />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={28} color="#444" />
          </TouchableOpacity>
          {/* Centered camera icon as per your image, with pickHeaderImage functionality */}
          <TouchableOpacity
            onPress={pickHeaderImage}
            style={styles.centerCameraBtn}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="add-a-photo"
              size={96}
              color="#bdbdbd"
              style={{ opacity: 0.28 }}
            />
          </TouchableOpacity>
        </ImageBackground>

        {/* Profile section */}
        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            <View style={styles.avatarColumn}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={
                    profile.profilePic && profile.profilePic.startsWith("http")
                      ? { uri: profile.profilePic }
                      : imageMap[profile.profilePic] || profilePic
                  }
                  style={styles.avatar}
                />
                <TouchableOpacity
                  style={styles.editAvatarBtn}
                  onPress={pickAndUpload}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="edit" size={18} color="#ffff" />
                </TouchableOpacity>
              </View>
              <View style={styles.profileInfo}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() => alert("Edit profile details")}
                    style={{ flexDirection: "row", alignItems: "center" }}
                    accessibilityLabel="Edit profile details"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.name}>{profile.displayName}</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#222"
                      style={{ marginLeft: 2, marginTop: 6 }}
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.username}>{profile.username}</Text>
                <Text style={styles.subInfo}>
                  <Ionicons name="business" size={14} color="#888" /> Wing{" "}
                  {profile.wing} - {profile.door}
                </Text>
              </View>
            </View>
            <View style={styles.statsColumnFixed}>
              <View style={styles.statsRowFixed}>
                <View style={styles.statBoxFixed}>
                  <Text style={styles.statNumber}>{profile.friends}</Text>
                  <Text style={styles.statLabel}>Friends</Text>
                </View>
                <View style={styles.statBoxFixed}>
                  <Text style={styles.statNumber}>{profile.posts.length}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bio Card - MOBILE FRIENDLY VERSION */}
          <View style={[styles.bioCard, { paddingBottom: 20 }]}>
            <EditableField
              value={profile.bio}
              editing={bioState.editing}
              inputValue={bioState.input}
              setInputValue={(v: string) =>
                setBioState((s) => ({ ...s, input: v }))
              }
              onSave={() => saveField("bio", bioState.input, setBioState)}
              onCancel={() =>
                setBioState((s) => ({
                  ...s,
                  editing: false,
                  input: profile.bio || "",
                }))
              }
              saving={bioState.saving}
              placeholder="Bio"
              icon={
                !profile.bio && (
                  <Ionicons
                    name="person-outline"
                    size={28}
                    color="#888"
                    style={{ marginRight: 10 }}
                  />
                )
              }
              multiline
              maxLength={500}
            />
          </View>

          {/* Add Hometown */}
          <View style={styles.hometownRow}>
            {hometownState.editing ? (
              <View style={styles.hometownInputRow}>
                <TextInput
                  style={styles.hometownInput}
                  value={hometownState.input}
                  onChangeText={(v: string) =>
                    setHometownState((s) => ({ ...s, input: v }))
                  }
                  placeholder="Enter hometown"
                  editable={!hometownState.saving}
                />
                <TouchableOpacity
                  onPress={() =>
                    saveField("hometown", hometownState.input, setHometownState)
                  }
                  disabled={hometownState.saving}
                  style={styles.hometownInputBtn}
                >
                  <Ionicons name="checkmark" size={24} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setHometownState((s) => ({
                      ...s,
                      editing: false,
                      input: profile.hometown || "",
                    }))
                  }
                  disabled={hometownState.saving}
                  style={styles.hometownInputBtn}
                >
                  <Ionicons name="close" size={24} color="#888" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                onPress={() =>
                  setHometownState((s) => ({ ...s, editing: true }))
                }
              >
                <Ionicons name="location-outline" size={18} color="#888" />
                <Text style={styles.hometownText}>
                  {profile.hometown ? profile.hometown : "Add hometown"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Posts Grid */}
        <View
          style={[styles.postsSection, { paddingBottom: insets.bottom + 20 }]}
        >
          <View style={styles.postsHeader}>
            <Text style={styles.postsTitle}>POSTS</Text>
            <TouchableOpacity
              onPress={() => setEditMode((e) => !e)}
              style={styles.editPostsBtn}
              accessibilityLabel="Edit posts"
            >
              <View style={styles.editIconWrapper}>
                <MaterialIcons
                  name="edit"
                  size={16}
                  color="#888"
                  style={styles.editIcon}
                />
              </View>
            </TouchableOpacity>
            {editMode && (
              <TouchableOpacity
                onPress={handleDeletePosts}
                style={styles.deletePostsBtn}
                accessibilityLabel="Delete selected posts"
              >
                <View style={styles.deleteIconWrapper}>
                  <MaterialIcons
                    name="delete"
                    size={16}
                    color="#fff"
                    style={styles.deleteIcon}
                  />
                </View>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            key={"posts-3col"}
            data={profile.posts}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.postWrapper}>
                <TouchableOpacity
                  onPress={() =>
                    editMode
                      ? toggleSelectPost(index)
                      : alert("Navigate to post detail")
                  }
                  style={styles.postContainer}
                  activeOpacity={0.7}
                >
                  <Image source={imageMap[item]} style={styles.postImage} />
                  {editMode && (
                    <View style={styles.checkboxContainer}>
                      <View
                        style={[
                          styles.checkbox,
                          selectedPosts.includes(index) &&
                            styles.checkboxSelected,
                        ]}
                      >
                        {selectedPosts.includes(index) && (
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        )}
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}
            numColumns={3}
            contentContainerStyle={[styles.postsGrid, { paddingBottom: 80 }]}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
        {uploading && <ActivityIndicator size="large" style={{ margin: 20 }} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default MyProfileScreen;
