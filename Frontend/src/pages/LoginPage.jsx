import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Lock, User } from "lucide-react"
import { useAuth } from "../context/AuthContext"

const LoginPage = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login failed")
        return
      }

      // Update auth context and localStorage
      login(data.user, data.token)
      
      // Navigate to dashboard
      navigate("/dashboard", { replace: true })
    } catch (err) {
      console.error("Login error:", err)
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#800000] to-[#600000] px-6 py-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                  <Lock className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white font-title">
                GUTS Inventory
              </h1>
              <p className="text-white/80 text-sm mt-2">
                Guardians Technical School - TESDA Training Center
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              {/* Username Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/20 transition"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-11 py-2.5 rounded-lg border border-slate-300 focus:border-[#800000] focus:outline-none focus:ring-2 focus:ring-[#800000]/20 transition"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-slate-400 hover:text-slate-600 transition"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#800000] to-[#600000] hover:from-[#700000] hover:to-[#500000] text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Footer Text */}
            <div className="mt-6 pt-6 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-600">
                For login support, contact your administrator.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Secure System © 2026 GUTS.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
