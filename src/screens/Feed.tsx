import * as React from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  SafeAreaView,
  StatusBar,
  ImageSourcePropType,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import FeedPostCard from "../components/FeedPostCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles, getFeedContainerStyle } from "../styles/feedStyles";
import api from "../api/axiosInstance";

Dimensions.get("window");

interface Post {
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
}

interface User {
  name: string;
  handle: string;
  avatar: ImageSourcePropType;
  username?: string;
}

const FeedScreen: React.FC = () => {
  const [loggedInUsername, setLoggedInUsername] = useState<string>("@unknown");
  const [commentController, setCommentController] = useState<string>("");
  const [showCommentsModal, setShowCommentsModal] = useState<boolean>(false);
  const [currentComments, setCurrentComments] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const res = await api.get("/posts");
        setPosts(
          res.data.map((post: any) => ({
            ...post,
            user: {
              id: post.userId,
              username: post.username,
              profilePic: post.profilePic,
              displayName: post.displayName || post.username,
            },
          }))
        );
        setLoading(false);
      } catch (err) {
        console.error("Failed to load feed:", err);
        setLoading(false);
      }
    };
    loadFeed();
    fetchLoggedInUsername();
  }, []);

  const fetchLoggedInUsername = async () => {
    setLoggedInUsername("@currentuser");
  };

  const toggleLike = (index: number) => {
    const updatedPosts = [...posts];
    const post = updatedPosts[index];
    if (post.isLiked) {
      post.likeCount = Math.max(0, (post.likeCount || 0) - 1);
    } else {
      post.likeCount = (post.likeCount || 0) + 1;
    }
    post.isLiked = !post.isLiked;
    setPosts(updatedPosts);
  };

  const openComments = (comments: string[]) => {
    setCurrentComments([...comments]);
    setShowCommentsModal(true);
  };

  const addComment = () => {
    const newComment = commentController.trim();
    if (newComment) {
      setCurrentComments([...currentComments, newComment]);
      setCommentController("");
    }
  };

  const closeComments = () => {
    setShowCommentsModal(false);
    setCurrentComments([]);
  };

  const renderPost = ({ item, index }: { item: Post; index: number }) => (
    <FeedPostCard
      post={item}
      onLike={() => toggleLike(index)}
      onComment={() => openComments(item.comments ?? [])}
      onShare={() => Alert.alert("Share functionality")}
      onSave={() => Alert.alert("Save functionality")}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* App Bar */}
      <View
        style={[
          styles.appBar,
          { paddingTop: insets.top, height: insets.top + 56 },
        ]}
      >
        <Image
          source={require("../../assets/images/zencoo.png")}
          style={[
            styles.logo,
            { position: "absolute", left: 0, top: insets.top, marginLeft: 0 },
          ]}
        />
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.notificationBtn}>
          <Icon name="bell-outline" size={30} color="#FFA500" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={getFeedContainerStyle(insets.bottom)}
        showsVerticalScrollIndicator={false}
      />

      {/* Comments Modal */}
      <Modal
        visible={showCommentsModal}
        animationType="slide"
        onRequestClose={closeComments}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comments</Text>
            <TouchableOpacity onPress={closeComments}>
              <Icon name="close" size={24} style={styles.closeButton} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={currentComments}
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <Text style={styles.commentText}>{item}</Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            style={styles.commentsList}
          />
          <View style={styles.commentInput}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your comment"
              value={commentController}
              onChangeText={setCommentController}
              multiline
            />
            <TouchableOpacity onPress={addComment} style={styles.sendButton}>
              <Icon name="send" size={22} style={styles.sendIcon} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default FeedScreen;
