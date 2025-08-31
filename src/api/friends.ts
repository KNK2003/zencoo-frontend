import api from "./axiosInstance";

export async function sendFriendRequest(senderId: string, receiverId: string) {
  return api.post("/friends/request", { senderId, receiverId });
}

export async function acceptFriendRequest(requestId: string) {
  return api.post("/friends/accept", { requestId });
}

export async function declineFriendRequest(requestId: string) {
  return api.post("/friends/decline", { requestId });
}

export async function unfriend(userA: string, userB: string) {
  return api.delete("/friends/unfriend", { data: { userA, userB } });
}

export async function getFriendsList(userId: string) {
  return api.get(`/friends/list/${userId}`);
}

export async function getFriendStatus(userA: string, userB: string) {
  return api.get(`/friends/status`, { params: { userA, userB } });
}

export async function getIncomingFriendRequests(userId: string) {
  return api.get(`/friends/requests/incoming/${userId}`);
}

export async function getPendingRequestId(
  senderId: string,
  receiverId: string
) {
  return api.get("/friends/pending-request", {
    params: { senderId, receiverId },
  });
}

export async function getFriendsCount(userId: string) {
  return api.get(`/friends/count/${userId}`);
}
