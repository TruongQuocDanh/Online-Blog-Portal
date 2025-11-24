import { api } from "./api";

export interface CreatePostRequest {
  authorId: number;
  title: string;
  content: string;
  status: number;
  category?: string;
  featured?: boolean;
}

export const createPostAPI = async (post: CreatePostRequest, files: File[]) => {
  const formData = new FormData();
  formData.append("post", JSON.stringify(post));
  files.forEach((file) => formData.append("files", file));

  const res = await api.post("/posts/create", formData);
  return res.data;
};

export const getAllPostsAPI = async () => {
  const res = await api.get("/posts");
  return res.data;
};

export const getPostByIdAPI = async (id: number) => {
  const res = await api.get(`/posts/${id}`);
  const p = res.data;

  return {
    id: p.postId,
    authorId: p.authorId,
    title: p.title,
    content: p.content,
    status: p.status,
    category: p.category,
    featured: p.featured,
    thumbnailUrl: p.thumbnailUrl,
    createdAt: p.createdAt,
    publishedAt: p.publishedAt,

    // FIX QUAN TRỌNG — GIỮ NGUYÊN OBJECT ẢNH
    images: Array.isArray(p.images)
      ? p.images.map((img: any) => ({
        id: img.id,
        imageUrl: img.imageUrl,
      }))
      : [],
  };
};

export const updatePostAPI = async (id: number, data: any) => {
  const res = await api.put(`/posts/${id}`, data);
  return res.data;
};

export const deletePostAPI = async (id: number) => {
  const res = await api.delete(`/posts/${id}`);
  return res.data;
};
