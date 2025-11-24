export interface User {
  id: string;
  email: string;
  name: string;
  displayName: string;
  password: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image?: string | null;
  authorId: string;
  authorName: string;
  createdAt: string;
  published: boolean;
  featured: boolean;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  postId: string;
  parentId?: string | null;
  createdAt: string;
}
