"use client"

import { useEffect, useState, useMemo } from "react"
import { ArrowUpDown, Search, Users, ShieldCheck } from "lucide-react"
import { userApi } from "@/lib/API/userAPI"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar";

type UserRow = {
    userId: number
    username: string
    displayName: string
    email: string
    role: number
    createdAt: string
}

export default function UserDirectoryPage() {
    const [users, setUsers] = useState<UserRow[]>([])
    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all")
    const [sortAsc, setSortAsc] = useState(true)

    useEffect(() => {
        const load = async () => {
            const data = await userApi.getAllUsers()
            setUsers(data)
        }
        load()
    }, [])

    const promoteUser = async (id: number) => {
        await userApi.updateUser(id, { role: 1 })
        setUsers(prev => prev.map(u => u.userId === id ? { ...u, role: 1 } : u))
    }

    const filtered = useMemo(() => {
        return users
            .filter(u => {
                const txt = (u.username + u.displayName + u.email).toLowerCase()
                const s = search.toLowerCase()
                const roleOK =
                    roleFilter === "all" ? true :
                        roleFilter === "admin" ? u.role === 1 :
                            u.role === 0
                return txt.includes(s) && roleOK
            })
            .sort((a, b) =>
                sortAsc ? a.userId - b.userId : b.userId - a.userId
            )
    }, [users, search, roleFilter, sortAsc])

    return (
        <>
            <Navbar />

            <main className="max-w-6xl mx-auto px-6 py-12">

                <div className="flex items-center gap-4 mb-10">
                    <Users className="w-10 h-10 text-primary drop-shadow" />
                    <h1 className="text-4xl font-extrabold">User Directory</h1>
                </div>

                {/* FILTER BAR */}
                <div className="
                p-6 rounded-2xl mb-10 flex flex-col sm:flex-row gap-5
                items-center justify-between 
                border border-white/20 shadow-xl
                bg-background/40 backdrop-blur-xl
            ">
                    <div className="relative w-full sm:w-1/3">
                        <Search className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
                        <Input
                            placeholder="Search user..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-background/60 backdrop-blur-xl border-white/20"
                        />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as any)}
                        className="px-4 py-2 rounded-xl bg-background/60 backdrop-blur-xl border border-white/20"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                    </select>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto rounded-2xl border border-white/20 shadow-xl bg-background/40 backdrop-blur-xl">
                    <table className="w-full text-sm">
                        <thead className="bg-white/10 backdrop-blur-xl">
                            <tr className="text-left">
                                <th
                                    className="p-4 cursor-pointer hover:bg-white/20 transition text-center"
                                    onClick={() => setSortAsc(!sortAsc)}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        ID <ArrowUpDown size={16} />
                                    </div>
                                </th>
                                <th className="p-4">USERNAME</th>
                                <th className="p-4">DISPLAY NAME</th>
                                <th className="p-4">EMAIL</th>
                                <th className="p-4">ROLE</th>
                                <th className="p-4">CREATED AT</th>
                                <th className="p-4">ACTION</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtered.map(u => (
                                <tr key={u.userId} className="hover:bg-white/10 transition border-t border-white/10">
                                    <td className="p-4 text-center font-semibold">{u.userId}</td>
                                    <td className="p-4">{u.username}</td>
                                    <td className="p-4">{u.displayName}</td>
                                    <td className="p-4">{u.email}</td>

                                    <td className="p-4">
                                        {u.role === 1 ? (
                                            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs">
                                                admin
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full bg-muted text-xs">
                                                user
                                            </span>
                                        )}
                                    </td>

                                    <td className="p-4">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>

                                    <td className="p-4 text-center">
                                        {u.role === 0 ? (
                                            <Button
                                                size="sm"
                                                onClick={() => promoteUser(u.userId)}
                                                className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-xl shadow-md"
                                            >
                                                <ShieldCheck size={16} className="mr-1" />
                                                Promote
                                            </Button>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">
                                                Already Admin
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            </main>
        </>
    )

}
