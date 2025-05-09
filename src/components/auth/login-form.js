//src/components/auth/login-form.js
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Eye, EyeOff, User, Key } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  async function onSubmit(data) {
    setIsLoading(true)
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        const result = await response.json()

        if (!response.ok) throw new Error(result.message || 'Login failed')

        // Ensure the result has 'data' with 'token' and 'user' properties
        if (!result.data || !result.data.token || !result.data.user) {
            throw new Error('Invalid response structure')
        }

        // Store token and user in localStorage
        localStorage.setItem('token', result.data.token)
        localStorage.setItem('user', JSON.stringify(result.data.user))

        toast({ title: 'Success', description: 'Logged in successfully' })

        const redirectPath = getRedirectPath(result.data.user.role)
        router.push(redirectPath)
    } catch (err) {
        toast({
            variant: 'destructive',
            title: 'Login failed',
            description: err.message,
        })
    } finally {
        setIsLoading(false)
    }
}



  function getRedirectPath(role) {
    switch (role) {
      case 'admin': return '/admin/dashboard'
      case 'hr': return '/hr/dashboard'
      case 'workManager': return '/manager/dashboard'
      case 'staff': return '/staff/dashboard'
      default: return '/dashboard'
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <Input
            id="username"
            placeholder="Enter your username"
            disabled={isLoading}
            className="pl-10"
            {...register('username', { required: 'Username is required' })}
          />
          <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
        {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password to login"
            disabled={isLoading}
            className="pl-10 pr-10"
            {...register('password', { required: 'Password is required' })}
          />
          <Key className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" className="h-4 w-4" /> Remember me
        </label>
        <a href="#" className="text-sm text-primary hover:underline">Forgot password?</a>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
}
