import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "../../styles/othersProfileStyles";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ResidentsStackParamList } from "../../navigation/ResidentsStack";
import { profilePic } from "../../constants/profileConstants";
import api from "../../api/axiosInstance"; // or your API utility

const HEADER_HEIGHT = 200;
Dimensions.get("window");

type Post = {
  id: number;
  imageUrl: string;
  caption: string;
  createdAt: string;
  // ...other fields
};

type Profile = {
  id: string;
  username: string;
  displayName: string;
  wing: string;
  door: string;
  bio: string;
  hometown: string;
  profilePic: string;
  headerBg: string | null;
  friends: number;
  posts: Post[];
  email: string;
};

const OthersProfileScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ResidentsStackParamList>>();
  const insets = useSafeAreaInsets();
  const route = useRoute();

  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
        const { id } = route.params as { id: string };
        const profileRes = await api.get(`/profile/${id}`);
        const postsRes = await api.get(`/posts/user/${id}`);
        setProfile({
          id: String(profileRes.data.id),
          username: profileRes.data.username,
          displayName: profileRes.data.fullName,
          wing: profileRes.data.doorNumber
            ? String(profileRes.data.doorNumber)[0]
            : "",
          door: profileRes.data.doorNumber,
          bio: profileRes.data.bio,
          hometown: profileRes.data.hometown,
          profilePic: profileRes.data.profilePic,
          headerBg: profileRes.data.headerBg,
          friends: 0, // You can add a friends count endpoint if needed
          posts: postsRes.data,
          email: profileRes.data.email,
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    fetchProfileAndPosts();
  }, [route.params]);

  if (!profile) return null; // or a loading spinner

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { height: HEADER_HEIGHT }]}>
        {profile?.headerBg && (
          <Image
            source={
              profile?.headerBg && profile.headerBg.startsWith("http")
                ? { uri: profile.headerBg }
                : require("../../../assets/images/header-backgroundimage.png") // fallback
            }
            style={styles.headerBgImage}
            onError={(e) =>
              console.log("Header image load error", e.nativeEvent)
            }
          />
        )}
        {/* Back Button OUTSIDE header but visually at top right */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={28} color="#444" />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileRow}>
          <View style={styles.avatarColumn}>
            <View style={styles.avatarWrapper}>
              <Image
                source={
                  profile?.profilePic && profile.profilePic.startsWith("http")
                    ? { uri: profile.profilePic }
                    : profilePic // fallback from your constants
                }
                style={styles.avatar}
                onError={(e) =>
                  console.log("Profile pic load error", e.nativeEvent)
                }
              />
            </View>
            <View style={styles.profileInfoFixed}>
              <Text style={styles.name}>{profile.displayName}</Text>
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
        {/* Bio */}
        <View style={styles.bioContainer}>
          <Text style={styles.bioText} numberOfLines={4} ellipsizeMode="tail">
            {profile.bio}
          </Text>
        </View>
        {/* Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.followBtn]}>
            <Text style={[styles.actionBtnText, { color: "#fff" }]}>
              Follow
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.messageBtn]}>
            <Text style={[styles.actionBtnText, { color: "#000" }]}>
              Message
            </Text>
          </TouchableOpacity>
        </View>
        {/* Location */}
        <View style={styles.hometownRow}>
          <Ionicons name="location-outline" size={18} color="#888" />
          <Text style={styles.hometownText}>{profile.hometown}</Text>
        </View>
      </View>

      {/* Posts Section */}
      <View style={styles.postsSection}>
        <FlatList
          data={profile?.posts || []}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          renderItem={({ item }) => (
            <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
          )}
          scrollEnabled={false}
          contentContainerStyle={styles.postsGrid}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScrollView>
  );
};

export default OthersProfileScreen;
