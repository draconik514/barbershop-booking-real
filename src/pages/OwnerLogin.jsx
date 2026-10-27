import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Scissors, Loader2 } from 'lucide-react'
import brand from '../config/brand'

function OwnerLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(username, password)
      toast.success('Login berhasil!')
      navigate('/manage-barbershop')
    } catch (error) {
      toast.error(error.message || 'Username atau password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scissors size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-primary">{brand.name}</h2>
          <p className="text-sm text-text-light mt-1">Masuk untuk mengelola dashboard</p>
        </div>

        <form className="card space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="label">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="input"
              placeholder="owner"
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              placeholder="••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Memproses...
              </span>
            ) : 'Login'}
          </button>

          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 text-center">
            <p className="font-semibold text-gray-600 mb-2">Demo Credentials</p>
            <button
              type="button"
              onClick={() => { setUsername('owner'); setPassword('barbershop123') }}
              className="w-full py-2 border border-dashed border-gray-300 rounded-lg hover:bg-gray-100 transition text-xs text-gray-500"
            >
              Klik untuk isi otomatis: <span className="font-mono font-semibold">owner / barbershop123</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OwnerLogin
