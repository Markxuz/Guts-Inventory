import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Lock, User } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { login as loginApi } from "../api/authApi"

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
      const data = await loginApi(username, password)

      // Update auth context and localStorage
      login(data.user, data.token)
      
      // Navigate to dashboard
      navigate("/dashboard", { replace: true })
    } catch (err) {
      console.error("Login error:", err)
      setError(err.response?.data?.error || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-t from-[#800000] to-white px-4">
      <div className="w-full max-w-md">
        {/* Card with gradient background */}
        <div className="rounded-3xl bg-gradient-to-b from-maroon-900 via-maroon-700 to-maroon-600 shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="px-6 py-12 text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/guts-logo.png" 
                alt="GUTS Logo" 
                className="h-12 w-12 object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-white">
              GUTS Consumables
            </h1>
            <p className="text-white/90 text-sm mt-2 font-medium">
              Guardians Technical School - TESDA Training Center
            </p>
          </div>

          {/* Form Section */}
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
                <label className="block text-sm font-semibold text-white mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30 transition bg-white"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-lg border border-slate-200 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30 transition bg-white"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
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
                className="w-full bg-red-950 hover:bg-black text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Support Text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-white/90">
                For login support, contact your administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
