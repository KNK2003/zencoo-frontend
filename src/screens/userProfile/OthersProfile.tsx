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
const HEADER_HEIGHT = 200;
Dimensions.get("window");

const imageMap: { [key: string]: any } = {
  "../../../assets/images/profile-pic.png": require("../../../assets/images/profile-pic.png"),
  "../../../assets/images/profile-placeholder.jpg": require("../../../assets/images/profile-placeholder.jpg"),
  "../../../assets/images/header-backgroundimage.png": require("../../../assets/images/header-backgroundimage.png"),
  "../../../assets/images/pulses.jpg": require("../../../assets/images/pulses.jpg"),
  "../../../assets/images/veggies (2).jpg": require("../../../assets/images/veggies (2).jpg"),
  "../../../assets/images/dates.jpg": require("../../../assets/images/dates.jpg"),
};

type Profile = {
  id: string;
  displayName: string;
  username: string;
  wing: string;
  door: string;
  bio: string;
  hometown: string;
  profilePic: string;
  headerBg: string;
  friends: number;
  posts: string[];
};

const OthersProfileScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ResidentsStackParamList>>();
  const insets = useSafeAreaInsets();
  const route = useRoute();

  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = require("../../data/othersProfiles.json"); // now an array
        const { id } = route.params as { id: string };
        const found = data.find((p: Profile) => p.id === id);
        setProfile(found);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    loadProfile();
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
            source={imageMap[profile.headerBg]}
            style={styles.headerBgImage}
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
                source={imageMap[profile.profilePic]}
                style={styles.avatar}
              />
            </View>
            <View style={styles.profileInfoFixed}>
              <Text style={styles.name}>{profile.displayName}</Text>
              <Text style={styles.username}>@{profile.username}</Text>
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
          keyExtractor={(_, idx) => idx.toString()}
          numColumns={3}
          renderItem={({ item }) => (
            <Image source={imageMap[item]} style={styles.postImage} />
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
