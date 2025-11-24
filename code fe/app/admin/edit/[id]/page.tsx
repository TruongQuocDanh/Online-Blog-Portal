"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import dynamic from "next/dynamic";
const RichTextEditor = dynamic(
    () => import("@/components/rich-text-editor"),
    { ssr: false }
);

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";

import { getPostByIdAPI, updatePostAPI } from "@/lib/API/postAPI";
import { getCurrentUser } from "@/lib/storage";

export default function EditPostPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const [user, setUser] = useState<any>(null);
    const [post, setPost] = useState<any>(null);

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [status, setStatus] = useState<0 | 1>(0);
    const [featured, setFeatured] = useState(false);
    const [content, setContent] = useState("");

    const [error, setError] = useState("");

    useEffect(() => {
        setUser(getCurrentUser());

        const load = async () => {
            try {
                const p = await getPostByIdAPI(id);
                setPost(p);

                console.log("AUTHOR:", p.authorId);

                setTitle(p.title);
                setCategory(p.category);
                setStatus(p.status);
                setFeatured(p.featured ?? false);
                setContent(p.content);
            } catch (err) {
                setError("Failed to load post.");
            }
        };

        load();
    }, [id]);

    const handleSubmit = async () => {
        setError("");

        if (!user) return;

        const payload = {
            title,
            content,
            category,
            status,
            featured,
            publishedAt:
                post.status !== 1 && status === 1
                    ? new Date().toISOString()
                    : post.publishedAt,
        };

        try {
            await updatePostAPI(id, payload);
            router.push(`/post/${id}`);
        } catch {
            setError("Failed to update post.");
        }
    };

    if (!post) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen flex items-center justify-center">
                    Loading...
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="max-w-4xl mx-auto py-10 px-4">
                <h1 className="text-4xl font-bold mb-6">Edit Post</h1>

                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-100 text-red-600 rounded-lg mb-6">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-6">

                    <div>
                        <label className="font-medium">Title</label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div>
                        <label className="font-medium">Category</label>
                        <Input
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="font-medium">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(Number(e.target.value) as 0 | 1)}
                            className="border rounded-md p-2 w-full bg-background"
                        >
                            <option value={0}>Draft</option>
                            <option value={1}>Published</option>
                        </select>
                    </div>

                    <div>
                        <label className="font-medium">Featured</label>
                        <select
                            value={featured ? "true" : "false"}
                            onChange={(e) => setFeatured(e.target.value === "true")}
                            className="border rounded-md p-2 w-full bg-background"
                        >
                            <option value="false">Normal</option>
                            <option value="true">Featured</option>
                        </select>
                    </div>

                    <div>
                        <label className="font-medium">Content</label>
                        <RichTextEditor value={content} onChange={setContent} />
                    </div>

                    <div className="flex gap-3 mt-5">
                        <Button onClick={handleSubmit}>Save</Button>

                        <Link href={`/post/${id}`}>
                            <Button variant="outline">Cancel</Button>
                        </Link>
                    </div>

                </div>
            </main>
        </>
    );
}
