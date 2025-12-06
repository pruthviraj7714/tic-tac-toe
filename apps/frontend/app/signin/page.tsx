"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function SignInPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 1000)
  }

  return (
    <main className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-[#0E121F]/60 rounded-xl p-8 border border-slate-800 backdrop-blur-sm">
        
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
              X
            </div>
            <span className="text-xl font-bold">TacticBoard</span>
          </Link>

          <h1 className="text-3xl font-bold mb-2 text-white">Welcome Back</h1>
          <p className="text-slate-400">Sign in to continue playing</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Username</label>
            <Input
              type="text"
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-400">
              <input type="checkbox" className="rounded border-slate-600 bg-slate-900" />
              Remember me
            </label>
            <Link href="#" className="text-blue-400 hover:text-blue-300">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#0B0F19] text-slate-400">New to TacticBoard?</span>
          </div>
        </div>

        <Link href="/signup">
          <Button
            variant="outline"
            className="w-full border-slate-700 text-slate-200 hover:bg-slate-900 bg-transparent"
          >
            Create Account
          </Button>
        </Link>

        <p className="text-center text-sm text-slate-500 mt-6">
          By signing in, you agree to our{" "}
          <Link href="#" className="text-blue-400 hover:text-blue-300">
            Terms of Service
          </Link>
        </p>
      </div>
    </main>
  )
}
