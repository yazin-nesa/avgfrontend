//src/app/login/page.js
'use client'

import LoginForm from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen max-w-7xl flex flex-col md:flex-row bg-background">
      {/* Left branding panel for desktop */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-primary text-primary-foreground p-10">
        <img src="/logo.png" alt="AVGmotors Logo" className="h-10 mb-4" />
        <h2 className="text-3xl font-bold mb-2">AVGmotors ERP</h2>
        <p className="text-sm opacity-80 text-center max-w-sm">
          Streamline your automotive business operations with our all-in-one ERP system.
        </p>
        <div className="mt-10 space-y-4 text-center text-sm opacity-90">
          <div>🚗 500+ Active Users</div>
          <div>💼 98% Satisfaction</div>
          <div>📞 24/7 Support</div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-6 md:p-10">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="md:hidden flex justify-center">
            <img src="/logo.png" alt="AVGmotors Logo" className="h-10 mb-4" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your account</p>
          </div>

          <LoginForm />

          <div className="text-center text-sm mt-4">
            Don't have an account?{' '}
            <a href="#" className="text-primary hover:underline">Request access</a>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            © {new Date().getFullYear()} AVGmotors. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
