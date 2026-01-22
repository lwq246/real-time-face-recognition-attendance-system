import axios from "axios";

export const loginAdmin = async (email: string, password: string) => {
  try {
    const response = await axios.post("/api/admin/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
