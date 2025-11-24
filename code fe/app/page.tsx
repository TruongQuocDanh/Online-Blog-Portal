"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import HeroCarousel from "@/components/hero-carousel"
import type { BlogPost } from "@/lib/types"
import { getAllPostsAPI } from "@/lib/API/postAPI"
import { userApi } from "@/lib/API/userAPI"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export default function Home() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  const BASE = "http://localhost:8080"

  useEffect(() => {
    async function load() {
      const data = await getAllPostsAPI()

      const users = await userApi.getAllUsers()
      const mapUser = new Map(users.map((u) => [u.userId, u.displayName]))

      // mapping BE → FE
      const mapped: BlogPost[] = data.map((p: any) => ({
        id: String(p.postId),
        title: p.title,
        excerpt: p.content?.substring(0, 100) ?? "", // note: short preview
        content: p.content,

        authorId: String(p.authorId),
        authorName: mapUser.get(p.authorId) ?? "Unknown",

        createdAt: p.createdAt,
        published: p.status === 1,
        featured: p.featured === true || p.featured === 1,

        category: p.category ?? "General",
        views: p.views ?? 0,

        image: p.thumbnailUrl ? `${BASE}${p.thumbnailUrl}` : null, // note: thumbnail

        images:
          p.images?.map((img: any) => ({
            id: img.id,
            imageUrl: `${BASE}${img.imageUrl}`,
          })) ?? [],
      }))

      setPosts(mapped)
      setLoading(false)
    }

    load()
  }, [])

  const trending = posts.filter((p) => p.featured)

  // note: banner lấy thumbnail của 3 bài featured
  const bannerImages = trending
    .slice(0, 3)
    .map((p) => p.image!)
    .filter(Boolean)

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pb-20">
        {/* Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 mb-20">
          <HeroCarousel images={bannerImages} />
        </section>

        {/* Trending */}
        <section
          id="posts"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-bold">Trending Posts 🔥</h2>
            <p className="text-sm text-muted-foreground">Featured articles</p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading posts...
            </div>
          ) : trending.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-4">No trending posts yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trending.map((post: BlogPost) => (
                <Link key={post.id} href={`/post/${post.id}`}>
                  <Card className="group h-full overflow-hidden border-border hover:border-primary transition">
                    {post.image && (
                      <div className="w-full h-48 overflow-hidden bg-muted">
                        <img
                          src={post.image}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                    )}

                    <CardHeader>
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${post.authorId}`}
                            className="w-5 h-5 rounded-full"
                          />
                          <span>{post.authorName}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          {new Date(post.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}
