import axios from "axios";

const BASE_URL = "http://localhost:8080/api/auth"; // Use localhost with adb reverse, or your PC IP if on real device

export async function checkEmailRegistered(email: string): Promise<boolean> {
  const res = await axios.get(`${BASE_URL}/check-email`, { params: { email } });
  return res.data.exists;
}

export async function checkUsernameUnique(username: string): Promise<boolean> {
  const res = await axios.get(`${BASE_URL}/check-username`, {
    params: { username },
  });
  return res.data.unique;
}

export async function registerUser(user: {
  email: string;
  username: string;
  password: string;
  fullName: string;
  doorNumber: string;
  community: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const res = await axios.post(`${BASE_URL}/register`, user);
    return { success: true, message: res.data.message };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || "Registration failed",
    };
  }
}

export async function validateLogin(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await axios.post(`${BASE_URL}/login`, { email, password });
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.response?.data?.message || "Login failed",
    };
  }
}
