import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api",
});

export const getKeys = () => api.get("/kmc/keys").then((r) => r.data);

export const listImages = () => api.get("/images").then((r) => r.data);

export const uploadImage = (formData) =>
  api.post("/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const tamperImage = (id) =>
  api.post(`/images/${id}/tamper`).then((r) => r.data);

export const imageFileUrl = (id) =>
  `http://localhost:5001/api/images/${id}/file`;

export const runQuery = (formData) =>
  api.post("/query", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const verifyRecord = (id) =>
  api.get(`/query/verify/${id}`).then((r) => r.data);

export const getChain = () =>
  api.get("/blockchain").then((r) => r.data);

export const getChainStatus = () =>
  api.get("/blockchain/status").then((r) => r.data);

export const getFederatedHistory = () =>
  api.get("/federated").then((r) => r.data);

export const runFederatedRound = () =>
  api.post("/federated/round").then((r) => r.data);

export const resetFederated = () =>
  api.post("/federated/reset").then((r) => r.data);

export default api;