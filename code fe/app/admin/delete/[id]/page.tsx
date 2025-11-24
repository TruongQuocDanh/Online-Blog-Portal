"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

import { getPostByIdAPI, deletePostAPI } from "@/lib/API/postAPI";
import { getCurrentUser } from "@/lib/storage";

export default function DeletePostPage() {
    const params = useParams();
    const router = useRouter();
    const postId = Number(params.id);

    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    const currentUser = getCurrentUser();

    useEffect(() => {
        const load = async () => {
            try {
                const p = await getPostByIdAPI(postId);
                setPost(p);
            } catch {
                setError("Failed to load post.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [postId]);

    const confirmDelete = async () => {
        if (!currentUser) {
            setError("You must be logged in.");
            return;
        }

        if (post.authorId !== Number(currentUser.id) && currentUser.role !== "admin") {
            setError("You do not have permission to delete this post.");
            return;
        }

        setDeleting(true);
        try {
            await deletePostAPI(postId);
            router.push("/");
        } catch {
            setError("Delete failed.");
            setDeleting(false);
        }
    };

    if (loading)
        return (
            <>
                <Navbar />
                <main className="min-h-screen flex items-center justify-center">
                    Loading...
                </main>
            </>
        );

    if (!post)
        return (
            <>
                <Navbar />
                <main className="min-h-screen flex items-center justify-center">
                    Post not found
                </main>
            </>
        );

    return (
        <>
            <Navbar />
            <main className="max-w-xl mx-auto px-4 py-20 text-center">

                {error && (
                    <p className="text-red-500 font-medium mb-4">{error}</p>
                )}

                <div className="flex justify-center mb-6">
                    <AlertTriangle className="text-red-500 w-20 h-20" />
                </div>

                <h1 className="text-3xl font-bold mb-4">Delete Post?</h1>

                <p className="text-muted-foreground mb-8">
                    Are you sure you want to permanently delete:
                </p>

                <p className="font-semibold text-lg mb-8">{post.title}</p>

                <div className="flex flex-col gap-4">
                    <Button
                        className="bg-red-600 hover:bg-red-700"
                        disabled={deleting}
                        onClick={confirmDelete}
                    >
                        {deleting ? "Deleting..." : "Yes, Delete"}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => router.push(`/post/${postId}`)}
                    >
                        Cancel
                    </Button>
                </div>
            </main>
        </>
    );
}
