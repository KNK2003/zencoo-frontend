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

interface FeedPostCardProps {
  post: {
    profilePicture: ImageSourcePropType;
    postImage: ImageSourcePropType;
    dishName: string;
    comments: string[];
    likeCount: number; // <-- add this
    postedTime: string;
    isLiked: boolean;
  };
  user: {
    name: string;
    handle: string;
    avatar: ImageSourcePropType;
  };
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
}

const FeedPostCard: React.FC<FeedPostCardProps> = ({
  post,
  user,
  onLike,
  onComment,
  onShare,
  onSave,
}) => (
  <View style={styles.card}>
    {/* Card Header */}
    <View style={styles.cardHeader}>
      <Image source={user.avatar} style={styles.avatar} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.handle}>{user.handle}</Text>
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
      <Image source={post.postImage} style={styles.cardImage} />
    </View>
    {/* Action Bar */}
    <View style={styles.actionBarContainer}>
      <View style={styles.actionBar}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.countText}>{post.likeCount}</Text>
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
          <Text style={styles.countText}>{post.comments.length}</Text>
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
    {/* Description and Time */}
    <Text style={styles.description}>
      Arabian Dates are naturally sweet, energy rich fruits cultivated in the
      Middle East, prized for their . . .
    </Text>
    <Text style={styles.timeText}>Posted {post.postedTime} ago</Text>
  </View>
);

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
    borderRadius: 18,
    marginTop: 10,
    marginBottom: 0,
    backgroundColor: "#eee",
  },
  actionBarContainer: {
    alignItems: "flex-start",
    paddingHorizontal: 0,
    marginTop: -38,
    marginBottom: 0,
    width: "100%",
  },
  actionBar: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.22)",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
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
