import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTimeAgo } from "../hooks/useTimeAgo"; // adjust path as needed
import { profilePic } from "../constants/profileConstants";

interface FeedPostCardProps {
  post: {
    id: number;
    imageUrl: string;
    caption: string;
    createdAt: string;
    likeCount?: number;
    comments?: string[];
    isLiked?: boolean;
    user?: {
      id: number;
      username: string;
      profilePic?: string;
      displayName?: string;
    };
  };
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
}

const FeedPostCard: React.FC<FeedPostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onSave,
}) => {
  const timeAgo = useTimeAgo(post.createdAt);

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <Image
          source={
            post.user?.profilePic && post.user.profilePic.startsWith("http")
              ? { uri: post.user.profilePic }
              : profilePic
          }
          style={styles.avatar}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.name}>
            {post.user?.displayName || post.user?.username || "User"}
          </Text>
          <Text style={styles.handle}>@{post.user?.username}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Icon name="cart-outline" size={22} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}>
          <Icon name="dots-vertical" size={22} color="#222" />
        </TouchableOpacity>
      </View>
      {/* Card Image */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: post.imageUrl }} style={styles.cardImage} />
        <View style={styles.actionBarOverlayAlt}>
          <View style={styles.actionBar}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.countText}>{post.likeCount ?? 0}</Text>
              <TouchableOpacity onPress={onLike}>
                <Icon
                  name={post.isLiked ? "heart" : "heart-outline"}
                  size={22}
                  color={post.isLiked ? "#E94F37" : "#fff"}
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.countText}>{post.comments?.length ?? 0}</Text>
              <TouchableOpacity onPress={onComment}>
                <Icon
                  name="comment-outline"
                  size={22}
                  color="#fff"
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onShare}>
              <Icon
                name="send-outline"
                size={22}
                color="#fff"
                style={styles.actionIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onSave}>
              <Icon
                name="bookmark-outline"
                size={22}
                color="#fff"
                style={styles.actionIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Description and Time */}
      <Text style={styles.description}>{post.caption}</Text>
      <Text style={styles.timeText}>{timeAgo}</Text>
    </View>
  );
};

const CARD_RADIUS = 22;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: CARD_RADIUS,
    marginHorizontal: 8,
    marginBottom: 18,
    paddingBottom: 0,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
    marginBottom: -2,
  },
  handle: {
    fontSize: 14,
    color: "#7B8CA6",
    marginTop: 0,
  },
  iconBtn: {
    marginLeft: 8,
    padding: 4,
  },
  imageWrapper: {
    width: "100%",
    alignItems: "center",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: 210,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginTop: 10,
    marginBottom: 0,
    backgroundColor: "#eee",
  },
  actionBarOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 54,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: "hidden",
    justifyContent: "center",
  },
  actionBarOverlayAlt: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 54,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: "rgba(0,0,0,0.18)", // semi-transparent black
    justifyContent: "center",
    overflow: "hidden",
  },
  actionBarContainer: {
    alignItems: "flex-start",
    paddingHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
    width: "100%",
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "transparent", // No color, let blur show
  },
  actionIcon: {
    marginRight: 0,
    marginLeft: 0,
    paddingHorizontal: 4, // reduced from 12
  },
  description: {
    fontSize: 15,
    color: "#444",
    paddingHorizontal: 16,
    marginBottom: 0,
    marginTop: 10,
    fontWeight: "400",
  },
  timeText: {
    fontSize: 13,
    color: "#B0B0B0",
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 2,
    textAlign: "left",
  },
  countText: {
    color: "#fff",
    fontSize: 15,
    marginRight: 2, // reduced from 8
    marginLeft: 0, // reduced from -4
    fontWeight: "bold",
  },
});

export default FeedPostCard;
