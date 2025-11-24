"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3, Calendar } from "lucide-react";

import { getCurrentUser } from "@/lib/storage";
import { getPostByIdAPI, deletePostAPI } from "@/lib/API/postAPI";

import {
  getCommentsByPostAPI,
  createCommentAPI,
  deleteCommentAPI,
} from "@/lib/API/commentAPI";

import { useKeenSlider } from "keen-slider/react";
import Zoom from "react-medium-image-zoom";

import "keen-slider/keen-slider.min.css";
import "react-medium-image-zoom/dist/styles.css";

const BASE = "http://localhost:8080";
const fix = (u: string) => (u?.startsWith("http") ? u : `${BASE}${u}`);

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params.id);

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [sliderRef] = useKeenSlider({
    loop: true,
    slides: { perView: 1 },
  });

  useEffect(() => {
    const load = async () => {
      setCurrentUser(getCurrentUser());

      const p = await getPostByIdAPI(postId);
      setPost(p);

      const c = await getCommentsByPostAPI(postId);
      setComments(c);

      setLoading(false);
    };

    load();
  }, [postId]);

  const sendComment = async (e: any) => {
    e.preventDefault();
    if (!currentUser) return router.push("/auth");
    if (!commentText.trim()) return;

    await createCommentAPI({
      postId,
      userId: Number(currentUser.id),
      content: commentText,
      parentId: replyTo,
    });

    setCommentText("");
    setReplyTo(null);
    setComments(await getCommentsByPostAPI(postId));
  };

  const confirmDeletePost = async () => {
    setDeleting(true);
    try {
      await deletePostAPI(postId);
      router.push("/");
    } catch {
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">Loading...</main>
      </>
    );

  if (!post)
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center">Post not found</main>
      </>
    );

  const canEdit =
    currentUser &&
    (Number(currentUser.id) === post.authorId || currentUser.role === "admin");

  return (
    <>
      <Navbar />

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999]">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-xl max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-3">Delete post?</h2>

            <p className="text-sm text-muted-foreground mb-6">
              This action cannot be undone.
            </p>

            <p className="font-medium mb-6">{post.title}</p>

            <div className="flex gap-3">
              <Button
                className="bg-red-600 hover:bg-red-700"
                disabled={deleting}
                onClick={confirmDeletePost}
              >
                {deleting ? "Deleting..." : "Yes, delete"}
              </Button>

              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen pb-20">
        {/* EDIT & DELETE */}
        {canEdit && (
          <div className="fixed right-6 top-1/3 flex flex-col gap-3 p-3 rounded-2xl bg-background/85 backdrop-blur-xl shadow-xl border border-border z-50">
            <button
              onClick={() => router.push(`/admin/edit/${postId}`)}
              className="h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-md flex items-center justify-center hover:scale-110 active:scale-95"
            >
              <Edit3 size={20} />
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="h-11 w-11 rounded-full bg-red-100 text-red-600 shadow-md flex items-center justify-center hover:bg-red-200 hover:scale-110 active:scale-95"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}

        {/* MULTIPLE IMAGE */}
        {post.images?.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 mt-10">
            <div
              ref={sliderRef}
              className="keen-slider overflow-hidden rounded-xl shadow-lg bg-muted/70"
              style={{ height: "380px" }}
            >
              {post.images.map((img: any, i: number) => (
                <div key={i} className="keen-slider__slide flex items-center justify-center p-2">
                  <Zoom>
                    <img
                      src={fix(img.imageUrl)}
                      className="h-full w-full object-cover rounded-md"
                    />
                  </Zoom>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* POST CONTENT */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-6">{post.title}</h1>

          <div className="flex gap-6 items-center text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <img
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${post.authorId}`}
                className="w-10 h-10 rounded-full"
              />
              <span>User #{post.authorId}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* COMMENT SECTION */}
        <div className="max-w-4xl mx-auto px-4 mt-10 mb-20">
          <h2 className="text-2xl font-semibold mb-4">Comments</h2>

          {/* COMMENT INPUT */}
          <form onSubmit={sendComment} className="mb-6">
            {replyTo && (
              <div className="text-xs mb-2 text-primary">
                Replying to comment #{replyTo}
                <button
                  type="button"
                  className="ml-3 text-red-500"
                  onClick={() => setReplyTo(null)}
                >
                  Cancel
                </button>
              </div>
            )}

            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full border rounded-lg p-3 bg-background"
              rows={3}
              placeholder="Write a comment..."
            />

            <Button type="submit" className="mt-3">
              Send
            </Button>
          </form>

          {/* COMMENT LIST */}
          <div className="space-y-5">
            {comments.map((c) => (
              <div
                key={c.id}
                className={`p-4 rounded-lg border ${c.parentId ? "ml-6 border-l-4 border-primary" : "border-border"
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${c.userId}`}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium">User #{c.userId}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="mb-3">{c.content}</p>

                <div className="flex gap-3 text-muted-foreground text-sm">
                  <button
                    className="hover:text-primary"
                    onClick={() => {
                      setReplyTo(c.id);
                      setCommentText(`@User${c.userId} `);
                    }}
                  >
                    Reply
                  </button>

                  {currentUser &&
                    (currentUser.id == c.userId || currentUser.role == "admin") && (
                      <button
                        className="hover:text-red-500"
                        onClick={async () => {
                          await deleteCommentAPI(c.id);
                          setComments(await getCommentsByPostAPI(postId));
                        }}
                      >
                        Delete
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
