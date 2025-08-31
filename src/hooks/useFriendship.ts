import { useState, useEffect } from "react";
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  unfriend,
  getFriendStatus,
  getPendingRequestId,
} from "../api/friends";
import Toast from "react-native-root-toast";

type Status = "NOT_FRIENDS" | "REQUEST_SENT" | "REQUEST_RECEIVED" | "FRIENDS";

export default function useFriendship(myId: string, otherId?: string) {
  const [status, setStatus] = useState<Status>("NOT_FRIENDS");
  const [loading, setLoading] = useState(true);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (!myId || !otherId) return;
    setLoading(true);
    getFriendStatus(myId, otherId)
      .then((res) => {
        setStatus(res.data.status);
        if (res.data.status === "REQUEST_RECEIVED") {
          // Fetch the pending requestId
          getPendingRequestId(otherId, myId)
            .then((r) => setRequestId(r.data.id))
            .catch(() => setRequestId(null));
        } else {
          setRequestId(null);
        }
      })
      .catch(() => setStatus("NOT_FRIENDS"))
      .finally(() => setLoading(false));
  }, [myId, otherId]);

  const sendRequest = async () => {
    await sendFriendRequest(myId, otherId!);
    setStatus("REQUEST_SENT");
    Toast.show("Friend request sent!", { duration: Toast.durations.SHORT });
  };
  const accept = () =>
    requestId
      ? acceptFriendRequest(requestId).then(() => setStatus("FRIENDS"))
      : Promise.resolve();
  const decline = () =>
    requestId
      ? declineFriendRequest(requestId).then(() => setStatus("NOT_FRIENDS"))
      : Promise.resolve();
  const removeFriend = () =>
    unfriend(myId, otherId!).then(() => setStatus("NOT_FRIENDS"));

  return { status, loading, sendRequest, accept, decline, removeFriend };
}
