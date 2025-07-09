import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import api from "../api/axiosInstance";
import { Profile } from "../types/myprofileTypes";

export const useMyProfile = (navigation: any) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const localData = require("../data/myProfile.json");
        const token = await SecureStore.getItemAsync("jwt");
        if (!token) {
          setError("You are not logged in.");
          setProfile(localData);
          return;
        }
        const res = await api.get("/profile");
        const data = res.data;
        setProfile({
          id: String(data.id),
          username: data.username,
          displayName: data.fullName,
          wing: data.doorNumber ? String(data.doorNumber)[0] : "",
          door: data.doorNumber,
          bio: data.bio,
          hometown: data.hometown,
          profilePic: data.profilePic,
          headerBg: data.headerBg ?? localData.headerBg,
          friends: data.friends ?? localData.friends,
          posts: [],
          email: data.email,
        });
        setError(null);
      } catch {
        setError("An error occurred loading your profile.");
        setProfile(require("../data/myProfile.json"));
      }
    })();
  }, [navigation]);
  return { profile, setProfile, error, setError };
};
