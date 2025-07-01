import * as SecureStore from "expo-secure-store";

export async function saveJWT(token: string) {
  await SecureStore.setItemAsync("jwt", token);
}
