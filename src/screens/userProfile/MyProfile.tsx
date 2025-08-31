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
  Alert,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles, GRID_SPACING } from "../../styles/myProfileStyles";
import { StackNavigationProp } from "@react-navigation/stack";
import { ProfileStackParamList } from "../../navigation/ProfileStack";
import { useProfileImageUpload } from "../../hooks/useProfileImageUpload";
import EditProfileModal from "./EditProfileModal";
import api from "../../api/axiosInstance";
import { profilePic } from "../../constants/profileConstants";
import { useMyProfile } from "../../hooks/useMyProfile";
import MyProfileEditableField from "../../components/MyProfileEditableField";
import { Profile } from "../../types/myprofileTypes";
import { getFriendsCount } from "../../api/friends";

const MyProfileScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<ProfileStackParamList>>();
  const { profile, setProfile } = useMyProfile(navigation);
  const insets = useSafeAreaInsets();
  const [editMode, setEditMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [fields, setFields] = useState({
    bio: { editing: false, input: "", saving: false },
    hometown: { editing: false, input: "", saving: false },
  });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [usernameLastChanged, setUsernameLastChanged] = useState<Date | null>(
    null
  );
  const [showPicOptions, setShowPicOptions] = useState(false);
  const [friendsCount, setFriendsCount] = useState<number>(0);

  useEffect(() => {
    if (profile && !fields.bio.editing)
      setFields((f) => ({ ...f, bio: { ...f.bio, input: profile.bio || "" } }));
    if (profile && !fields.hometown.editing)
      setFields((f) => ({
        ...f,
        hometown: { ...f.hometown, input: profile.hometown || "" },
      }));
  }, [profile, fields.bio.editing, fields.hometown.editing]);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      try {
        const res = await api.get(`/posts/user/${profile.id}`);
        setProfile((prev) => (prev ? { ...prev, posts: res.data } : prev));
      } catch {}
    })();
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) return;
    getFriendsCount(profile.id)
      .then((res) => setFriendsCount(res.data.count))
      .catch(() => setFriendsCount(0));
  }, [profile?.id]);

  const saveField = useCallback(
    async (field: "bio" | "hometown", value: string) => {
      if (!profile) return;
      setFields((f) => ({ ...f, [field]: { ...f[field], saving: true } }));
      try {
        const res = await api.patch(`/profile/${field}`, { [field]: value });
        setProfile((prev) =>
          prev ? { ...prev, [field]: res.data[field] } : prev
        );
        setFields((f) => ({ ...f, [field]: { ...f[field], editing: false } }));
      } catch {
        alert(`Failed to save ${field}. Please try again.`);
      } finally {
        setFields((f) => ({ ...f, [field]: { ...f[field], saving: false } }));
      }
    },
    [profile, setProfile]
  );

  const toggleSelectPost = (idx: number) =>
    setSelectedPosts((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );

  const handleDeletePosts = () => {
    if (!selectedPosts.length) return;
    if (
      window.confirm
        ? window.confirm("Are you sure you want to delete the selected posts?")
        : true
    ) {
      setSelectedPosts([]);
      setEditMode(false);
    }
  };

  const { uploading, pickAndUpload } = useProfileImageUpload(async (url) => {
    setProfile((prev) => (prev ? { ...prev, profilePic: url } : prev));
    try {
      await api.patch("/profile/profile-pic", { profilePic: url });
    } catch {
      Alert.alert("Failed to save profile picture to backend.");
    }
  });

  const { pickAndUpload: pickAndUploadHeader } = useProfileImageUpload(
    async (url) => {
      setProfile((prev) => (prev ? { ...prev, headerBg: url } : prev));
      try {
        await api.patch("/profile/header-bg", { headerBg: url });
      } catch {
        Alert.alert("Failed to save header image to backend.");
      }
    }
  );

  const handleProfileEditSave = async (updatedProfile: Profile) => {
    setProfile((prev) => (prev ? { ...prev, ...updatedProfile } : prev));
    setShowEditProfile(false);
  };

  if (!profile) return null;

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
          <TouchableOpacity
            onPress={async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [3, 2],
                quality: 1,
              });
              if (!result.canceled && result.assets?.length)
                await pickAndUploadHeader(result.assets[0].uri);
            }}
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
          <TouchableOpacity
            style={{
              position: "absolute",
              top: insets.top + 12,
              right: 16,
              zIndex: 10,
              padding: 8,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.7)",
            }}
            onPress={() => {}}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#444" />
          </TouchableOpacity>
        </ImageBackground>

        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            <View style={styles.avatarColumn}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={
                    profile.profilePic && profile.profilePic.startsWith("http")
                      ? { uri: profile.profilePic }
                      : profilePic
                  }
                  style={styles.avatar}
                />
                <TouchableOpacity
                  style={styles.editAvatarBtn}
                  onPress={() => setShowPicOptions(true)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="edit" size={18} color="#ffff" />
                </TouchableOpacity>
              </View>
              <View style={styles.profileInfo}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() => setShowEditProfile(true)}
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
                <TouchableOpacity
                  style={styles.statBoxFixed}
                  onPress={() =>
                    navigation.navigate("FriendsListScreen", { userId: profile.id })
                  }
                  accessibilityLabel="View friends list"
                  activeOpacity={0.7}
                >
                  <Text style={styles.statNumber}>{friendsCount}</Text>
                  <Text style={styles.statLabel}>Friends</Text>
                </TouchableOpacity>
                <View style={styles.statBoxFixed}>
                  <Text style={styles.statNumber}>{profile.posts.length}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.bioCard, { paddingBottom: 20 }]}>
            <MyProfileEditableField
              value={profile.bio}
              editing={fields.bio.editing}
              inputValue={fields.bio.input}
              setInputValue={(v) =>
                setFields((f) => ({ ...f, bio: { ...f.bio, input: v } }))
              }
              setEditing={(editing) =>
                setFields((f) => ({ ...f, bio: { ...f.bio, editing } }))
              }
              onSave={() => saveField("bio", fields.bio.input)}
              onCancel={() =>
                setFields((f) => ({
                  ...f,
                  bio: { ...f.bio, editing: false, input: profile.bio || "" },
                }))
              }
              saving={fields.bio.saving}
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

          <View style={styles.hometownRow}>
            {fields.hometown.editing ? (
              <View style={styles.hometownInputRow}>
                <TextInput
                  style={styles.hometownInput}
                  value={fields.hometown.input}
                  onChangeText={(v) =>
                    setFields((f) => ({
                      ...f,
                      hometown: { ...f.hometown, input: v },
                    }))
                  }
                  placeholder="Enter hometown"
                  editable={!fields.hometown.saving}
                />
                <TouchableOpacity
                  onPress={() => saveField("hometown", fields.hometown.input)}
                  disabled={fields.hometown.saving}
                  style={styles.hometownInputBtn}
                >
                  <Ionicons name="checkmark" size={24} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    setFields((f) => ({
                      ...f,
                      hometown: {
                        ...f.hometown,
                        editing: false,
                        input: profile.hometown || "",
                      },
                    }))
                  }
                  disabled={fields.hometown.saving}
                  style={styles.hometownInputBtn}
                >
                  <Ionicons name="close" size={24} color="#888" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                onPress={() =>
                  setFields((f) => ({
                    ...f,
                    hometown: { ...f.hometown, editing: true },
                  }))
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
            data={profile.posts}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.postWrapper}>
                <TouchableOpacity
                  style={styles.postContainer}
                  activeOpacity={0.7}
                  onPress={() =>
                    editMode
                      ? toggleSelectPost(index)
                      : alert("Navigate to post detail")
                  }
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.postImage}
                  />
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
            columnWrapperStyle={{ gap: GRID_SPACING }}
            contentContainerStyle={styles.postsGrid}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
        {uploading && <ActivityIndicator size="large" style={{ margin: 20 }} />}
      </ScrollView>
      <EditProfileModal
        visible={showEditProfile}
        profile={profile}
        onClose={() => setShowEditProfile(false)}
        onSave={handleProfileEditSave}
        usernameLastChanged={usernameLastChanged}
      />
      <Modal
        visible={showPicOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicOptions(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 24,
              width: 280,
              alignItems: "center",
              elevation: 10,
            }}
          >
            <TouchableOpacity
              style={{ paddingVertical: 12, width: "100%" }}
              onPress={async () => {
                setShowPicOptions(false);
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 1,
                });
                if (!result.canceled && result.assets?.length)
                  await pickAndUpload(result.assets[0].uri);
              }}
            >
              <Text style={{ fontSize: 16, textAlign: "center" }}>
                Choose New Photo
              </Text>
            </TouchableOpacity>
            {profile.profilePic && profile.profilePic.startsWith("http") && (
              <TouchableOpacity
                style={{ paddingVertical: 12, width: "100%" }}
                onPress={async () => {
                  setShowPicOptions(false);
                  setProfile((prev) =>
                    prev ? { ...prev, profilePic: "" } : prev
                  );
                  try {
                    await api.patch("/profile/profile-pic", { profilePic: "" });
                  } catch {
                    Alert.alert("Failed to remove profile picture.");
                  }
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: "red",
                    textAlign: "center",
                  }}
                >
                  Remove Photo
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={{ paddingVertical: 12, width: "100%" }}
              onPress={() => setShowPicOptions(false)}
            >
              <Text
                style={{ fontSize: 16, color: "#888", textAlign: "center" }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default MyProfileScreen;
