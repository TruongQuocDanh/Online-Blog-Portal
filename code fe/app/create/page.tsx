"use client"

import { useState, useEffect, type ChangeEvent, type FormEvent, type DragEvent } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import type { User } from "@/lib/types"
import { getCurrentUser } from "@/lib/storage"
import { createPostAPI } from "@/lib/API/postAPI"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import RichTextEditor from "@/components/rich-text-editor"
import { AlertCircle, X } from "lucide-react"

import styles from "./CreatePostPage.module.css"

export default function Page() {
  const router = useRouter()

  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("General")
  const [featured, setFeatured] = useState(false)
  const [status, setStatus] = useState(1)

  const [imagesPreview, setImagesPreview] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }
    setCurrentUser(user)
  }, [router])

  const processFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      setImageFiles((prev) => [...prev, file])
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagesPreview((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files)
      e.dataTransfer.clearData()
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const removeImage = (index: number) => {
    setImagesPreview((prev) => prev.filter((_, i) => i !== index))
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required")
      return
    }

    setLoading(true)
    try {
      await createPostAPI(
        {
          authorId: Number(currentUser?.id),
          title,
          content,
          category,
          featured,
          status,
        },
        imageFiles
      )
      router.push("/")
    } catch {
      setError("Failed to create post.")
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser)
    return (
      <>
        <Navbar />
        <main className={styles.loading}>Loading...</main>
      </>
    )

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.wrapper}>
          <Card className={styles.card}>
            <CardHeader>
              <CardTitle className={styles.title}>Create New Post</CardTitle>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className={styles.form}>

                {error && (
                  <div className={styles.errorBox}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                <div className={styles.field}>
                  <label className={styles.label}>Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Category</label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={styles.input}
                  />
                </div>

                <div className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={() => setFeatured(!featured)}
                    className={styles.checkbox}
                  />
                  <label>Feature this post on homepage</label>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(Number(e.target.value))}
                    className={styles.select}
                  >
                    <option value={1}>Published</option>
                    <option value={0}>Draft</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Images</label>

                  {/* DRAG AREA */}
                  <div
                    className={`${styles.uploadZone} ${isDragging ? styles.uploadZoneDragging : ""
                      }`}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="upload-images"
                      multiple
                      accept="image/*"
                      className={styles.hiddenInput}
                      onChange={handleImageUpload}
                    />

                    <label htmlFor="upload-images" className={styles.uploadBox}>
                      <span className={styles.uploadTitle}>Click to upload</span>
                      <span className={styles.uploadHint}>or drag & drop images here</span>
                    </label>
                  </div>

                  {imagesPreview.length > 0 && (
                    <div className={styles.previewGrid}>
                      {imagesPreview.map((src, idx) => (
                        <div key={idx} className={styles.previewItem}>
                          <img src={src} className={styles.previewImg} />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className={styles.removeBtn}
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Content</label>
                  <RichTextEditor value={content} onChange={setContent} />
                </div>

                <div className={styles.buttonRow}>
                  <Button type="submit" disabled={loading} className={styles.publishBtn}>
                    {loading ? "Publishing..." : "Publish"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={styles.cancelBtn}
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
