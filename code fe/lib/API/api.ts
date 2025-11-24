import axios from "axios";
import { getToken } from "../storage";

export const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  console.log("SENDING TOKEN =", token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


