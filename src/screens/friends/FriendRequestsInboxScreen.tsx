import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import FriendRequestCard from "../../components/FriendRequestCard";
import { getIncomingFriendRequests, acceptFriendRequest, declineFriendRequest } from "../../api/friends";

interface FriendRequest {
  id: string;
  senderId: string;
  profilePic?: string;
  displayName: string;
  username: string;
  door: string;
  timestamp: string;
}

const FriendRequestsInboxScreen = () => {
  const route = useRoute();
  const { userId } = route.params as { userId: string };
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getIncomingFriendRequests(userId);
      // Adjust mapping if needed to match your FriendRequestCard props
      setRequests(res.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load friend requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [userId]);

  const handleAccept = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      
      // Find the accepted request to show user name
      const acceptedRequest = requests.find(r => r.id === requestId);
      if (acceptedRequest) {
        Alert.alert("Success", `You are now friends with ${acceptedRequest.displayName}!`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to accept friend request.");
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await declineFriendRequest(requestId);
      
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      Alert.alert("Success", "Friend request declined.");
    } catch (error) {
      Alert.alert("Error", "Failed to decline friend request.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading friend requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friend Requests</Text>
        <Text style={styles.headerSubtitle}>
          {requests.length} {requests.length === 1 ? 'request' : 'requests'}
        </Text>
      </View>
      
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendRequestCard
            id={item.id}
            profilePic={item.profilePic}
            displayName={item.displayName}
            username={item.username}
            door={item.door}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No friend requests</Text>
            <Text style={styles.emptySubtext}>You're all caught up!</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5ECF6",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#888",
  },
});

export default FriendRequestsInboxScreen;