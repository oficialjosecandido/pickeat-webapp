import axios from "axios";

const baseURL =
  "https://pickeat-backend.azurewebsites.net/";

// const baseURL = "http://192.168.1.241:8080/";

const api = axios.create({
  baseURL,
});

export default api;
