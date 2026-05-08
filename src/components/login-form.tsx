import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type LoginFormProps = React.ComponentProps<"div"> & {
  role: 'teacher' | 'student'
  setRole: (role: 'teacher' | 'student') => void

  email: string
  setEmail: (v: string) => void

  password: string
  setPassword: (v: string) => void

  onSubmit: () => void
  loading: boolean
  error?: string | null
  sessionExpired?: boolean
}

export function LoginForm({
  className,
  role,
  setRole,
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  loading,
  error,
  sessionExpired,
  ...props
}: LoginFormProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant={role === "teacher" ? "default" : "outline"}
              onClick={() => setRole("teacher")}
            >
              Teacher
            </Button>
            <Button
              type="button"
              variant={role === "student" ? "default" : "outline"}
              onClick={() => setRole("student")}
            >
              Student
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit()
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="ichigo@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>

                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>

              {sessionExpired && (
                <p className="text-sm text-red-500">
                  Your session has expired. Please log in again.
                </p>
              )}

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Field>
                <Button type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>

                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <a href="/register" className="underline">
                    Sign up
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}