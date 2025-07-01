import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ImageBackground,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { styles } from "../../styles/myProfileStyles";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/types";

const profilePic = require("../../../assets/images/profile-placeholder.jpg");

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

const MyProfileScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const insets = useSafeAreaInsets();
  const [error, setError] = useState<string | null>(null);
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [bioSaving, setBioSaving] = useState(false);

  // 2. Load profile from local JSON (or future API)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const localData = require("../../data/myProfile.json");
        const token = await SecureStore.getItemAsync("jwt");
        if (!token) {
          setError("You are not logged in.");
          setProfile(localData);
          console.log("No token, using localData:", localData);
          return;
        }

        const res = await fetch("http://localhost:8080/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          setError("Session expired or unauthorized.");
          setProfile(localData);
          console.log("401 Unauthorized, using localData:", localData);
          return;
        }

        if (!res.ok) {
          setError("Failed to fetch profile.");
          setProfile(localData);
          console.log("Fetch not ok, using localData:", localData);
          return;
        }

        const data = await res.json();
        console.log("Backend profile data:", data);

        const mergedProfile = {
          ...localData,
          id: String(data.id),
          username: data.username,
          displayName: data.fullName,
          wing: data.doorNumber ? String(data.doorNumber)[0] : "",
          door: data.doorNumber,
        };
        setProfile(mergedProfile);
        console.log("Merged profile set to state:", mergedProfile);
        setError(null);
      } catch (err) {
        setError("An error occurred loading your profile.");
        const localData = require("../../data/myProfile.json");
        setProfile(localData);
        console.log("Error, using localData:", localData, err);
      }
    };
    fetchProfile();
  }, [navigation]);

  // When profile changes, update bioInput if not editing
  useEffect(() => {
    if (profile && !editingBio) setBioInput(profile.bio || "");
  }, [profile, editingBio]);

  // Save bio to backend
  const saveBio = async () => {
    if (!profile) return;
    setBioSaving(true);
    try {
      const token = await SecureStore.getItemAsync("jwt");
      if (!token) throw new Error("Not authenticated");
      const res = await fetch("http://localhost:8080/api/profile/bio", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio: bioInput }),
      });
      if (!res.ok) throw new Error("Failed to save bio");
      const data = await res.json();
      setProfile((prev) => (prev ? { ...prev, bio: data.bio } : prev));
      setEditingBio(false);
    } catch (err) {
      alert("Failed to save bio. Please try again.");
    } finally {
      setBioSaving(false);
    }
  };

  if (!profile) return null; // or a loading spinner

  // Pick image from gallery
  const pickHeaderImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // fixed here
      allowsEditing: true,
      aspect: [3, 2],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfile((prev) =>
        prev ? { ...prev, headerBg: result.assets[0].uri } : null
      );
    }
  };

  // Pick profile image from gallery
  const pickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // updated here
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      // setProfilePic(result.assets[0].uri);
    }
  };

  // Toggle post selection
  const toggleSelectPost = (idx: number) => {
    setSelectedPosts((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Delete selected posts with confirmation
  const handleDeletePosts = () => {
    if (selectedPosts.length === 0) return;
    // Show confirmation
    if (
      window.confirm
        ? window.confirm("Are you sure you want to delete the selected posts?")
        : true // fallback for native Alert
    ) {
      // Remove selected posts
      const newPosts = profile.posts.filter(
        (_, idx) => !selectedPosts.includes(idx)
      );
      // You may want to update your posts state here if posts are in state
      setSelectedPosts([]);
      setEditMode(false);
      // If posts are in state, update them here
      // setPosts(newPosts);
    }
  };

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
          style={[styles.header, { paddingTop: insets.top }]} // add safe area padding here
          imageStyle={styles.headerBgImage}
        >
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: "rgba(0,0,0,0.18)",
            }}
          />
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
                <Image source={profilePic} style={styles.avatar} />
                <TouchableOpacity
                  style={styles.editAvatarBtn}
                  onPress={pickProfileImage}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="edit" size={18} color="#ffff" />
                </TouchableOpacity>
              </View>
              <View style={styles.profileInfo}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() => {
                      // Open edit modal or navigate to edit screen
                      alert("Edit profile details");
                    }}
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
            {editingBio ? (
              <View style={{ width: '100%' }}>
                <TextInput
                  style={{
                    height: 80,
                    borderColor: "#ddd",
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    backgroundColor: "#fff",
                    textAlignVertical: 'top',
                    marginBottom: 10,
                  }}
                  value={bioInput}
                  onChangeText={(text) => {
                    if (text.length <= 500) setBioInput(text);
                  }}
                  placeholder="Write something about yourself..."
                  multiline
                  maxLength={500}
                  editable={!bioSaving}
                />
                
                <Text style={{
                  fontSize: 12,
                  color: '#666',
                  textAlign: 'right',
                  marginBottom: 15,
                }}>
                  {bioInput.length}/500
                </Text>
                
                {/* Simple button row */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: 10,
                }}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingBio(false);
                      setBioInput(profile?.bio || "");
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: '#f5f5f5',
                      padding: 12,
                      borderRadius: 6,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#ddd',
                    }}
                    disabled={bioSaving}
                  >
                    <Text style={{
                      color: '#333',
                      fontWeight: '600',
                      fontSize: 16,
                    }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={saveBio}
                    style={{
                      flex: 1,
                      backgroundColor: '#007AFF',
                      padding: 12,
                      borderRadius: 6,
                      alignItems: 'center',
                      opacity: bioSaving ? 0.7 : 1,
                    }}
                    disabled={bioSaving}
                  >
                    {bioSaving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={{
                        color: '#fff',
                        fontWeight: '600',
                        fontSize: 16,
                      }}>
                        Save
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                onPress={() => setEditingBio(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="person-outline"
                  size={28}
                  color="#888"
                  style={{ marginRight: 10 }}
                />
                <View>
                  {profile?.bio ? (
                    <Text style={styles.bioTitle}>{profile.bio}</Text>
                  ) : (
                    <>
                      <Text style={styles.bioTitle}>Add Bio</Text>
                      <Text style={styles.bioSubtitle}>
                        Tell others about yourself
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Add Hometown */}
          <TouchableOpacity style={styles.hometownRow}>
            <Ionicons name="location-outline" size={18} color="#888" />
            <Text style={styles.hometownText}>Add hometown</Text>
          </TouchableOpacity>
        </View>

        {/* Posts Grid */}
        <View
          style={[styles.postsSection, { paddingBottom: insets.bottom + 20 }]}
        >
          <View style={styles.postsHeader}>
            <Text style={styles.postsTitle}>POSTS</Text>
            <TouchableOpacity
              onPress={() => setEditMode((prev) => !prev)}
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
                style={{
                  marginLeft: 12,
                  backgroundColor: "#ff8c00",
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
                disabled={selectedPosts.length === 0}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={profile.posts}
            keyExtractor={(_, idx) => idx.toString()}
            numColumns={3}
            renderItem={({ item, index }) => (
              <View style={{ position: "relative" }}>
                <TouchableOpacity
                  activeOpacity={editMode ? 0.7 : 1}
                  onPress={() => editMode && toggleSelectPost(index)}
                  style={{}}
                >
                  <Image source={imageMap[item]} style={styles.postImage} />
                  {editMode && (
                    <View style={styles.checkboxContainer}>
                      <View
                        style={[
                          styles.checkbox,
                          selectedPosts.includes(index) && styles.checkboxSelected,
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
            contentContainerStyle={[styles.postsGrid, { paddingBottom: 80 }]}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false} // FlatList doesn't need to scroll, ScrollView will handle it
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default MyProfileScreen;

const imageMap: { [key: string]: any } = {
  "../../../assets/images/pulses.jpg": require("../../../assets/images/pulses.jpg"),
  "../../../assets/images/veggies (2).jpg": require("../../../assets/images/veggies (2).jpg"),
  "../../../assets/images/dates.jpg": require("../../../assets/images/dates.jpg"),
  "../../../assets/images/profile-placeholder.jpg": require("../../../assets/images/profile-placeholder.jpg"),
  // Add all other images you use
};