"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./AuthSlider.module.css"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"

import { userApi } from "@/lib/API/userAPI"
import { saveAuth } from "@/lib/storage"

export default function AuthPage() {
    const router = useRouter()

    const [isSignUp, setIsSignUp] = useState(false)

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const [username, setUsername] = useState("")
    const [displayName, setDisplayName] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const switchMode = () => {
        setError("")
        setIsSignUp(!isSignUp)
    }

    const handleLogin = async (e: any) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await userApi.login(email, password)

            saveAuth(res.token, {
                id: String(res.userId),
                email: res.email,
                name: "",
                displayName: res.displayName,
                password: "",
                role: res.role === 1 ? "admin" : "user",
                createdAt: "",
            })

            router.push("/")
        } catch {
            setError("Invalid email or password")
        }

        setLoading(false)
    }

    const handleSignup = async (e: any) => {
        e.preventDefault()
        setError("")

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        try {
            setLoading(true)
            await userApi.createUser({
                username,
                email,
                displayName,
                passwordHash: password,
            })
            setIsSignUp(false)
        } catch {
            setError("Signup failed")
        }

        setLoading(false)
    }

    return (
        <>
            <Navbar />

            <div className={styles.wrapper}>
                <div className={`${styles.container} ${isSignUp ? styles.tiltRight : styles.tiltLeft}`}>

                    <div className={`${styles.form} ${!isSignUp ? styles.formVisibleRight : styles.formHiddenLeft}`}>
                        <h2 className={styles.title}>Sign In</h2>

                        {!isSignUp && error && (
                            <div className={styles.errorBox}>
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className={styles.formGroup}>
                            <Input
                                placeholder="Enter your email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <Input
                                placeholder="Enter your password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <Button disabled={loading} className={styles.submitBtn}>
                                {loading ? "Signing in..." : "Sign In"}
                            </Button>
                        </form>

                        <p className={styles.textSwitch}>
                            Don't have an account?
                            <button onClick={switchMode} className={styles.switchBtn}>Sign Up</button>
                        </p>
                    </div>

                    <div className={`${styles.form} ${isSignUp ? styles.formVisibleLeft : styles.formHiddenRight}`}>
                        <h2 className={styles.title}>Create Account</h2>

                        {isSignUp && error && (
                            <div className={styles.errorBox}>
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSignup} className={styles.formGroup}>
                            <Input
                                placeholder="Enter a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />

                            <Input
                                placeholder="Enter your display name"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                required
                            />

                            <Input
                                placeholder="Enter your email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <Input
                                placeholder="Enter password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <Input
                                placeholder="Confirm password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />

                            <Button disabled={loading} className={styles.submitBtn}>
                                {loading ? "Creating..." : "Sign Up"}
                            </Button>
                        </form>

                        <p className={styles.textSwitch}>
                            Already have an account?
                            <button onClick={switchMode} className={styles.switchBtn}>Sign In</button>
                        </p>
                    </div>

                    <div className={`${styles.panel} ${isSignUp ? styles.panelRight : styles.panelLeft}`}>
                        <div className={styles.panelInner}>
                            <h2>{isSignUp ? "Welcome Back!" : "Hello, Friend!"}</h2>
                            <p>{isSignUp ? "Sign in to continue your journey." : "Register now to access all features."}</p>

                            <Button className={styles.panelBtn} onClick={switchMode}>
                                {isSignUp ? "Sign In" : "Sign Up"}
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}
