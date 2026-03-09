import { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { getFriendsList, unfriend, getFriendsCount } from "../../api/friends";
import { Friend } from "../../types/friendTypes";
import { useRoute } from "@react-navigation/native";

const FriendsListScreen = () => {
  const route = useRoute();
  const { userId } = route.params as { userId: string };
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsCount, setFriendsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await getFriendsList(userId);
      setFriends(res.data);
    } catch {
      Alert.alert("Failed to load friends.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [userId]);

  useEffect(() => {
    getFriendsCount(userId)
      .then(res => setFriendsCount(res.data.count))
      .catch(() => setFriendsCount(0));
  }, [userId]);

  const handleUnfriend = async (friendId: string) => {
    Alert.alert("Unfriend", "Are you sure you want to remove this friend?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unfriend",
        style: "destructive",
        onPress: async () => {
          try {
            await unfriend(userId, friendId);
            setFriends((prev) => prev.filter((f) => f.userId !== friendId));
          } catch {
            Alert.alert("Failed to unfriend.");
          }
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Text style={{ fontWeight: "bold", fontSize: 18, margin: 16 }}>
        Friends ({friendsCount})
      </Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
            <Image source={{ uri: item.profilePic }} style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "bold" }}>{item.fullName}</Text>
              <Text style={{ color: "#888" }}>{item.username}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleUnfriend(item.userId)}
              style={{ padding: 8, backgroundColor: "#eee", borderRadius: 8 }}
            >
              <Text style={{ color: "red" }}>Unfollow</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 40 }}>No friends yet.</Text>}
      />
    </View>
  );
};

export default FriendsListScreen;