"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import type { BlogPost, User } from "@/lib/types"
import { getCurrentUser, saveAuth, convertBackendUser } from "@/lib/storage"
import { getAllPostsAPI } from "@/lib/API/postAPI"
import { userApi } from "@/lib/API/userAPI"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { Calendar, Edit3, Star, Trash2, UserCircle, Lock } from "lucide-react"

const BASE = "http://localhost:8080"
const fix = (u: string) => (u?.startsWith("http") ? u : `${BASE}${u}`)

export default function ProfilePage() {
    const router = useRouter()
    const [currentUser, setCurrentUserState] = useState<User | null>(null)

    const [posts, setPosts] = useState<BlogPost[]>([])
    const [loadingPosts, setLoadingPosts] = useState(true)

    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const [form, setForm] = useState({
        username: "",
        displayName: "",
        email: "",
    })

    const [pwModalOpen, setPwModalOpen] = useState(false)
    const [pwLoading, setPwLoading] = useState(false)
    const [pwError, setPwError] = useState("")
    const [pwForm, setPwForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    })

    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [deleteError, setDeleteError] = useState("")

    useEffect(() => {
        const boot = async () => {
            const local = getCurrentUser()
            if (!local) {
                router.push("/auth")
                return
            }

            try {
                const fresh = await userApi.getUserById(Number(local.id))
                const mapped = convertBackendUser(fresh)
                saveAuth(localStorage.getItem("jwt_token") || "", mapped)
                setCurrentUserState(mapped)
                setForm({
                    username: mapped.name || "",
                    displayName: mapped.displayName || "",
                    email: mapped.email || "",
                })
            } catch {
                setCurrentUserState(local)
                setForm({
                    username: local.name || "",
                    displayName: local.displayName || "",
                    email: local.email || "",
                })
            }
        }

        boot()
    }, [router])

    useEffect(() => {
        async function loadPosts() {
            try {
                const u = getCurrentUser()
                if (!u) return
                const all = await getAllPostsAPI()
                const mine = all.filter((p: any) => Number(p.authorId) === Number(u.id))

                const mapped: BlogPost[] = mine.map((p: any) => ({
                    id: String(p.postId),
                    title: p.title,
                    excerpt: p.content?.substring(0, 100) ?? "",
                    content: p.content,
                    authorId: String(p.authorId),
                    authorName: p.authorName ?? "",
                    createdAt: p.createdAt,
                    published: p.status === 1,
                    featured: p.featured === true || p.featured === 1,
                    image: p.thumbnailUrl ? `${BASE}${p.thumbnailUrl}` : null,
                }))

                setPosts(mapped)
            } finally {
                setLoadingPosts(false)
            }
        }
        loadPosts()
    }, [])

    const roleLabel = useMemo(() => {
        if (!currentUser) return "Member"
        return currentUser.role === "admin" ? "Admin" : "Member"
    }, [currentUser])

    const onChangeForm = (k: keyof typeof form, v: string) => {
        setForm((p) => ({ ...p, [k]: v }))
    }

    const startEdit = () => {
        if (!currentUser) return
        setError("")
        setSuccess("")
        setIsEditing(true)
    }

    const cancelEdit = () => {
        if (!currentUser) return
        setIsEditing(false)
        setForm({
            username: currentUser.name || "",
            displayName: currentUser.displayName || "",
            email: currentUser.email || "",
        })
    }

    const saveProfile = async () => {
        if (!currentUser) return
        setSaving(true)
        setError("")
        setSuccess("")

        try {
            const payload = {
                username: form.username.trim(),
                displayName: form.displayName.trim(),
                email: form.email.trim(),
            }

            const res = await userApi.updateUser(Number(currentUser.id), payload)
            const updated = convertBackendUser(res)

            saveAuth(localStorage.getItem("jwt_token") || "", updated)
            setCurrentUserState(updated)

            setIsEditing(false)
            setSuccess("Profile updated successfully.")
        } catch (e: any) {
            setError(e?.response?.data?.message || "Update failed.")
        } finally {
            setSaving(false)
        }
    }

    const changePassword = async () => {
        if (!currentUser) return
        setPwError("")
        setPwLoading(true)

        try {
            if (!pwForm.oldPassword || !pwForm.newPassword) {
                setPwError("Please fill all fields.")
                setPwLoading(false)
                return
            }
            if (pwForm.newPassword !== pwForm.confirmNewPassword) {
                setPwError("Passwords do not match.")
                setPwLoading(false)
                return
            }

            await userApi.updateUser(Number(currentUser.id), {
                passwordHash: pwForm.newPassword,
            } as any)

            setPwModalOpen(false)
            setPwForm({ oldPassword: "", newPassword: "", confirmNewPassword: "" })
            setSuccess("Password changed successfully.")
        } catch (e: any) {
            setPwError(e?.response?.data?.message || "Change password failed.")
        } finally {
            setPwLoading(false)
        }
    }

    const deleteAccount = async () => {
        if (!currentUser) return
        setDeleteError("")
        setDeleteLoading(true)

        try {
            await userApi.deleteUser(Number(currentUser.id))
            localStorage.removeItem("jwt_token")
            localStorage.removeItem("blog_current_user")
            setDeleteModalOpen(false)
            router.push("/")
        } catch (e: any) {
            setDeleteError(e?.response?.data?.message || "Delete account failed.")
        } finally {
            setDeleteLoading(false)
        }
    }

    if (!currentUser) return null

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-background pb-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

                    <Card>
                        <CardContent className="py-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-muted overflow-hidden">
                                        <img
                                            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${currentUser.id}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-2xl font-bold">
                                                {currentUser.displayName || currentUser.name}
                                            </h1>
                                            <Badge
                                                variant={currentUser.role === "admin" ? "default" : "secondary"}
                                            >
                                                {roleLabel}
                                            </Badge>
                                        </div>

                                        <p className="text-muted-foreground text-sm mt-1">
                                            {currentUser.email}
                                        </p>

                                        <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <UserCircle size={16} />
                                                {currentUser.name}
                                            </span>

                                            <span className="flex items-center gap-1">
                                                <Calendar size={16} />
                                                {currentUser.createdAt
                                                    ? new Date(currentUser.createdAt).toLocaleDateString("en-GB")
                                                    : "—"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:ml-auto flex flex-wrap gap-2">
                                    {!isEditing ? (
                                        <Button onClick={startEdit} className="gap-2">
                                            <Edit3 size={16} />
                                            Edit Profile
                                        </Button>
                                    ) : (
                                        <>
                                            <Button onClick={saveProfile} disabled={saving} className="gap-2">
                                                {saving ? "Saving..." : "Save"}
                                            </Button>
                                            <Button onClick={cancelEdit} variant="outline">
                                                Cancel
                                            </Button>
                                        </>
                                    )}

                                    <Dialog open={pwModalOpen} onOpenChange={setPwModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="gap-2">
                                                <Lock size={16} />
                                                Change Password
                                            </Button>
                                        </DialogTrigger>

                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Change password</DialogTitle>
                                                <DialogDescription>
                                                    Enter your old password and a new one.
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="space-y-3">
                                                {pwError && (
                                                    <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                                                        {pwError}
                                                    </div>
                                                )}

                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Old password</label>
                                                    <Input
                                                        type="password"
                                                        value={pwForm.oldPassword}
                                                        onChange={(e) =>
                                                            setPwForm((p) => ({ ...p, oldPassword: e.target.value }))
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">New password</label>
                                                    <Input
                                                        type="password"
                                                        value={pwForm.newPassword}
                                                        onChange={(e) =>
                                                            setPwForm((p) => ({ ...p, newPassword: e.target.value }))
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">
                                                        Confirm new password
                                                    </label>
                                                    <Input
                                                        type="password"
                                                        value={pwForm.confirmNewPassword}
                                                        onChange={(e) =>
                                                            setPwForm((p) => ({
                                                                ...p,
                                                                confirmNewPassword: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <DialogFooter className="mt-4">
                                                <Button onClick={changePassword} disabled={pwLoading} className="w-full">
                                                    {pwLoading ? "Updating..." : "Update password"}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="destructive" className="gap-2">
                                                <Trash2 size={16} />
                                                Delete Account
                                            </Button>
                                        </DialogTrigger>

                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Delete account</DialogTitle>
                                                <DialogDescription>
                                                    This action cannot be undone.
                                                </DialogDescription>
                                            </DialogHeader>

                                            {deleteError && (
                                                <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                                                    {deleteError}
                                                </div>
                                            )}

                                            <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setDeleteModalOpen(false)}
                                                    disabled={deleteLoading}
                                                    className="w-full"
                                                >
                                                    Cancel
                                                </Button>

                                                <Button
                                                    variant="destructive"
                                                    onClick={deleteAccount}
                                                    disabled={deleteLoading}
                                                    className="w-full"
                                                >
                                                    {deleteLoading ? "Deleting..." : "Delete"}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-3">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Display name</label>
                                    <Input
                                        value={form.displayName}
                                        onChange={(e) => onChangeForm("displayName", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Username</label>
                                    <Input
                                        value={form.username}
                                        onChange={(e) => onChangeForm("username", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => onChangeForm("email", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            {(error || success) && (
                                <div className="mt-4">
                                    {error && (
                                        <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                                            {error}
                                        </div>
                                    )}
                                    {success && (
                                        <div className="text-sm text-green-700 bg-green-500/10 px-3 py-2 rounded-md">
                                            {success}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">My Posts</h2>
                        <Link href="/create">
                            <Button>Create Post</Button>
                        </Link>
                    </div>

                    {loadingPosts ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Loading posts...
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            You haven't created any posts yet.
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                                <Card key={post.id} className="overflow-hidden border-border">
                                    {post.image && (
                                        <div className="w-full h-44 bg-muted overflow-hidden">
                                            <img
                                                src={fix(post.image)}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    <CardHeader>
                                        <CardTitle className="line-clamp-2">{post.title}</CardTitle>

                                        <div className="flex gap-2 mt-2">
                                            {post.published ? (
                                                <Badge className="bg-green-600">Published</Badge>
                                            ) : (
                                                <Badge variant="secondary">Draft</Badge>
                                            )}

                                            {post.featured && (
                                                <Badge className="flex items-center gap-1 bg-yellow-500">
                                                    <Star size={14} /> Featured
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="text-sm text-muted-foreground space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            {new Date(post.createdAt).toLocaleString("en-GB", {
                                                timeZone: "UTC",
                                            })}
                                        </div>

                                        <div className="flex justify-between pt-3">
                                            <Link href={`/admin/edit/${post.id}`}>
                                                <Button size="sm" variant="outline" className="gap-1">
                                                    <Edit3 size={16} /> Edit
                                                </Button>
                                            </Link>

                                            <Link href={`/post/${post.id}`}>
                                                <Button size="sm" variant="ghost">
                                                    View
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    )
}
