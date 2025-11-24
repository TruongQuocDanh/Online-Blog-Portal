"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCurrentUser } from "@/lib/storage"
import { getAllPostsAPI } from "@/lib/API/postAPI"
import { userApi } from "@/lib/API/userAPI"
import { Pencil, Trash2, Star, Calendar, Search, Filter } from "lucide-react"
import { deletePostAPI } from "@/lib/API/postAPI";

type PostRow = {
    id: number
    title: string
    status: number
    featured: boolean | number
    createdAt: string
    category?: string
    authorId: number
    image?: string | null
}

export default function DashboardPage() {
    const [posts, setPosts] = useState<PostRow[]>([])
    const [loading, setLoading] = useState(true)

    const BASE = "http://localhost:8080"
    const currentUser = getCurrentUser()

    const [userMap, setUserMap] = useState<Record<number, string>>({})

    const [search, setSearch] = useState("")
    const [filterCategory, setFilterCategory] = useState<string>("all")
    const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft">("all")
    const [filterFeatured, setFilterFeatured] = useState<"all" | "featured" | "normal">("all")

    const [page, setPage] = useState(1)
    const pageSize = 6

    const formatDate = (iso: string) => {
        const d = new Date(iso)
        return d.toLocaleDateString("en-GB", { timeZone: "UTC" })
    }

    useEffect(() => {
        async function load() {
            const allPosts = await getAllPostsAPI()

            const userIds: number[] = Array.from(
                new Set(allPosts.map((p: any) => Number(p.authorId)))
            )

            const userData: Record<number, string> = {}
            for (const uid of userIds) {
                try {
                    const u = await userApi.getUserById(uid)
                    userData[uid] = u.displayName || u.username || "Unknown"
                } catch {
                    userData[uid] = "Unknown"
                }
            }

            setUserMap(userData)

            const mapped: PostRow[] = allPosts.map((p: any) => ({
                id: Number(p.postId),
                title: p.title,
                status: Number(p.status),
                featured: p.featured === true || p.featured === 1,
                createdAt: p.createdAt,
                category: p.category,
                authorId: Number(p.authorId),
                image: p.thumbnailUrl ? `${BASE}${p.thumbnailUrl}` : null,
            }))

            setPosts(mapped)
            setLoading(false)
        }

        load()
    }, [])

    const categories = useMemo(() => {
        const set = new Set<string>()
        posts.forEach((p) => {
            if (p.category) set.add(p.category)
        })
        return ["all", ...Array.from(set)]
    }, [posts])

    const filteredPosts = useMemo(() => {
        const q = search.trim().toLowerCase()

        return posts.filter((p) => {
            const okSearch = !q || p.title.toLowerCase().includes(q)

            const okCategory =
                filterCategory === "all" || (p.category || "").toLowerCase() === filterCategory.toLowerCase()

            const okStatus =
                filterStatus === "all" ||
                (filterStatus === "published" && p.status === 1) ||
                (filterStatus === "draft" && p.status !== 1)

            const isFeatured = !!p.featured
            const okFeatured =
                filterFeatured === "all" ||
                (filterFeatured === "featured" && isFeatured) ||
                (filterFeatured === "normal" && !isFeatured)

            return okSearch && okCategory && okStatus && okFeatured
        })
    }, [posts, search, filterCategory, filterStatus, filterFeatured])

    const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize))

    useEffect(() => {
        if (page > totalPages) setPage(1)
    }, [totalPages, page])

    const paginatedPosts = useMemo(() => {
        const start = (page - 1) * pageSize
        return filteredPosts.slice(start, start + pageSize)
    }, [filteredPosts, page])

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            await deletePostAPI(id);
            alert("Post deleted successfully!");

            setPosts((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            console.log(err);
            alert("Failed to delete post.");
        }
    };


    const canEditPost = (authorId: number) =>
        currentUser?.role === "admin" || Number(currentUser?.id) === Number(authorId)

    const pagesToShow = useMemo(() => {
        const arr: number[] = []
        const start = Math.max(1, page - 2)
        const end = Math.min(totalPages, page + 2)
        for (let i = start; i <= end; i++) arr.push(i)
        return arr
    }, [page, totalPages])

    return (
        <>
            <Navbar />

            <main className="min-h-screen max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>

                    <div className="flex items-center gap-2">
                        <Link href="/create">
                            <Button>Create New</Button>
                        </Link>
                    </div>
                </div>

                <div className="bg-white border rounded-xl shadow-sm p-4 mb-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                placeholder="Search by title..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    setPage(1)
                                }}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Filter size={16} />
                                Filters
                            </div>

                            <select
                                className="h-9 px-3 rounded-md border bg-background text-sm"
                                value={filterCategory}
                                onChange={(e) => {
                                    setFilterCategory(e.target.value)
                                    setPage(1)
                                }}
                            >
                                {categories.map((c) => (
                                    <option key={c} value={c}>
                                        {c === "all" ? "All categories" : c}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="h-9 px-3 rounded-md border bg-background text-sm"
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value as any)
                                    setPage(1)
                                }}
                            >
                                <option value="all">Default</option>
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>

                            <select
                                className="h-9 px-3 rounded-md border bg-background text-sm"
                                value={filterFeatured}
                                onChange={(e) => {
                                    setFilterFeatured(e.target.value as any)
                                    setPage(1)
                                }}
                            >
                                <option value="all">Default</option>
                                <option value="featured">Featured</option>
                                <option value="normal">Not featured</option>
                            </select>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearch("")
                                    setFilterCategory("all")
                                    setFilterStatus("all")
                                    setFilterFeatured("all")
                                    setPage(1)
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full table-auto">
                        <thead className="bg-muted text-sm font-medium text-muted-foreground">
                            <tr>
                                <th className="py-3 px-4 text-left w-[70px]">ID</th>
                                <th className="py-3 px-4 text-left">Title</th>
                                <th className="py-3 px-4 text-left">Author</th>
                                <th className="py-3 px-4 text-left">Category</th>
                                <th className="py-3 px-4 text-left">Status</th>
                                <th className="py-3 px-4 text-left">Published At</th>
                                <th className="py-3 px-4 text-left w-[140px]">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-muted-foreground">
                                        Loading...
                                    </td>
                                </tr>
                            ) : filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-muted-foreground">
                                        No posts found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedPosts.map((post) => {
                                    const canEdit = canEditPost(post.authorId)
                                    const isFeatured = !!post.featured

                                    return (
                                        <tr key={post.id} className="border-t hover:bg-muted/40 transition">
                                            <td className="py-4 px-4">{post.id}</td>

                                            <td className="py-4 px-4">
                                                <Link className="text-blue-600 hover:underline" href={`/post/${post.id}`}>
                                                    {post.title}
                                                </Link>
                                            </td>

                                            <td className="py-4 px-4">{userMap[post.authorId] || "Unknown"}</td>

                                            <td className="py-4 px-4">{post.category || "—"}</td>

                                            <td className="py-4 px-4">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {post.status === 1 ? (
                                                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                                            Published
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-semibold">
                                                            Draft
                                                        </span>
                                                    )}

                                                    {isFeatured && (
                                                        <span className="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold inline-flex items-center gap-1">
                                                            <Star size={12} />
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar size={14} />
                                                    {formatDate(post.createdAt)}
                                                </div>
                                            </td>

                                            <td className="py-4 px-4">
                                                {canEdit ? (
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/admin/edit/${post.id}`}>
                                                            <button
                                                                aria-label="Edit"
                                                                className="p-2 rounded-md border hover:bg-muted transition"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>
                                                        </Link>

                                                        <button
                                                            aria-label="Delete"
                                                            onClick={() => handleDelete(post.id)}
                                                            className="p-2 rounded-md border border-red-500 text-red-600 hover:bg-red-50 transition"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredPosts.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
                        <div className="text-sm text-muted-foreground">
                            Showing {(page - 1) * pageSize + 1}–
                            {Math.min(page * pageSize, filteredPosts.length)} of {filteredPosts.length}
                        </div>

                        <div className="flex items-center justify-center gap-1 mx-auto">
                            <button
                                className="h-9 px-3 rounded-md border text-sm hover:bg-muted disabled:opacity-50"
                                onClick={() => setPage(1)}
                                disabled={page === 1}
                            >
                                {"<<"}
                            </button>
                            <button
                                className="h-9 px-3 rounded-md border text-sm hover:bg-muted disabled:opacity-50"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                {"<"}
                            </button>

                            {pagesToShow[0] > 1 && (
                                <>
                                    <button
                                        className="h-9 w-9 rounded-md border text-sm hover:bg-muted"
                                        onClick={() => setPage(1)}
                                    >
                                        1
                                    </button>
                                    {pagesToShow[0] > 2 && (
                                        <span className="px-2 text-muted-foreground">…</span>
                                    )}
                                </>
                            )}

                            {pagesToShow.map((p) => (
                                <button
                                    key={p}
                                    className={`h-9 w-9 rounded-md border text-sm hover:bg-muted ${p === page ? "bg-muted font-semibold" : ""
                                        }`}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </button>
                            ))}

                            {pagesToShow[pagesToShow.length - 1] < totalPages && (
                                <>
                                    {pagesToShow[pagesToShow.length - 1] < totalPages - 1 && (
                                        <span className="px-2 text-muted-foreground">…</span>
                                    )}
                                    <button
                                        className="h-9 w-9 rounded-md border text-sm hover:bg-muted"
                                        onClick={() => setPage(totalPages)}
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}

                            <button
                                className="h-9 px-3 rounded-md border text-sm hover:bg-muted disabled:opacity-50"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                {">"}
                            </button>
                            <button
                                className="h-9 px-3 rounded-md border text-sm hover:bg-muted disabled:opacity-50"
                                onClick={() => setPage(totalPages)}
                                disabled={page === totalPages}
                            >
                                {">>"}
                            </button>
                        </div>

                        <div className="hidden sm:block w-[140px]" />
                    </div>
                )}
            </main>
        </>
    )
}
