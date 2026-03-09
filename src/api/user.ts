import axiosInstance from "./axiosInstance";

export async function checkEmailRegistered(email: string): Promise<boolean> {
  const res = await axiosInstance.get(`/auth/check-email`, { params: { email } });
  return res.data.exists;
}

export async function checkUsernameUnique(username: string): Promise<boolean> {
  const res = await axiosInstance.get(`/auth/check-username`, {
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
    // Clean the user data
    const cleanUser = {
      email: user.email.trim().toLowerCase(),
      username: user.username.trim(),
      password: user.password.trim(),
      fullName: user.fullName.trim(),
      doorNumber: user.doorNumber.trim(),
      community: user.community.trim()
    };
    
    console.log("Registering user:", { 
      ...cleanUser, 
      password: "***" 
    });
    
    const res = await axiosInstance.post(`/auth/register`, cleanUser);
    return { success: true, message: res.data.message };
  } catch (err: any) {
    console.error("Registration failed:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.response?.data?.message || "Registration failed"
    });
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
    // Trim whitespace and convert email to lowercase
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    
    console.log("Cleaned credentials:", { 
      email: cleanEmail, 
      passwordLength: cleanPassword.length,
      originalEmail: `"${email}"`,
      originalPassword: `"${password}"`
    });
    
    const res = await axiosInstance.post(`/auth/login`, { 
      email: cleanEmail, 
      password: cleanPassword 
    });
    return { success: true };
  } catch (err: any) {
    console.error("Login failed:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.response?.data?.message || "Login failed"
    });
    return {
      success: false,
      error: err.response?.data?.message || "Login failed",
    };
  }
}
