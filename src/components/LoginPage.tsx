import { useState, type FormEvent } from 'react'
import { Button, IconButton, InputAdornment, TextField } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

type LoginPageProps = {
  onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (userId.trim() && password) onLogin()
  }

  return (
    <main className="login-page flex min-h-screen items-center justify-center px-5 py-10">
      <section className="login-card w-full max-w-[440px] rounded-md bg-white p-8 sm:p-10">
        <div className="mb-9">
          <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-brand">
            <span className="text-2xl font-bold">C</span>
          </div>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.14em] text-slate-500">
            Candidate communication
          </p>
          <h1 className="text-[28px] font-semibold leading-tight text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in to manage your candidate conversations.</p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <TextField
            label="User ID"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            autoComplete="username"
            required
            fullWidth
          />
          <TextField
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((visible) => !visible)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" variant="contained" size="large" className="mt-1 !h-12 !normal-case !text-base">
            Sign in
          </Button>
        </form>
      </section>
    </main>
  )
}
