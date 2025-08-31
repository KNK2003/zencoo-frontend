import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { profilePic } from "../constants/profileConstants";

interface FriendRequestCardProps {
  id: string;
  profilePic?: string;
  displayName: string;
  username: string;
  door: string;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
  id,
  profilePic: userProfilePic,
  displayName,
  username,
  door,
  onAccept,
  onDecline,
}) => {
  // Extract wing from door number (first character)
  const wing = door ? door[0] : "?";

  return (
    <View style={styles.card}>
      <View style={styles.profileSection}>
        <Image
          source={
            userProfilePic && userProfilePic.trim() !== ""
              ? { uri: userProfilePic }
              : profilePic
          }
          style={styles.profilePic}
        />
        <View style={styles.userInfo}>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.location}>
            Wing {wing} • Door {door}
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.declineButton]}
          onPress={() => onDecline(id)}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={() => onAccept(id)}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: "#888",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#FF8C00",
  },
  declineButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  declineButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default FriendRequestCard;
