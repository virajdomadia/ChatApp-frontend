import axios from "axios";

const API = axios.create({
  baseURL: "https://chatapp-backend-ezbn.onrender.com/api",
});

export default API;
