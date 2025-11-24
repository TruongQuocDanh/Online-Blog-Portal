import { api } from "./api";

export async function createCommentAPI(data: {
  postId: number | string;
  userId: number | string;
  parentId?: number | string | null;
  content: string;
}) {
  const res = await api.post("/comments/create", data);
  return res.data;
}

export async function getCommentsByPostAPI(postId: number | string) {
  const res = await api.get(`/comments/post/${postId}`);
  return res.data;
}

export async function getCommentByIdAPI(id: number | string) {
  const res = await api.get(`/comments/${id}`);
  return res.data;
}

export async function deleteCommentAPI(id: number | string) {
  const res = await api.delete(`/comments/delete/${id}`);
  return res.data;
}
