import { LoginForm } from "@/components/auth/login-form"
import { Calendar } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left side: Logo and Branding */}
      <div className="flex-col bg-primary justify-center p-8 text-primary-foreground w-1/2 hidden items-center lg:flex">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex bg-primary-foreground h-20 justify-center rounded-full text-primary w-20 items-center">
            <Calendar className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">ShiftCare</h1>
          <p className="text-center text-lg max-w-md">
            Your comprehensive solution for seamless shift management. Organize, track, and optimize your workforce
            effortlessly.
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex flex-1 bg-background justify-center p-8 items-center">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Welcome Back!</h2>
            <p className="text-muted-foreground mt-2">Sign in to your account to continue.</p>
          </div>
          <LoginForm />
          <p className="text-center text-muted-foreground text-sm">
            Don&apos;t have an account?{" "}
            <a href="#" className="text-primary font-medium hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
