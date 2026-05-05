import React from "react"
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

type SignupFormProps = React.ComponentProps<typeof Card> & {
  role: 'teacher' | 'student'
  setRole: (role: 'teacher' | 'student') => void

  name: string
  setName: (v: string) => void

  email: string
  setEmail: (v: string) => void

  password: string
  setPassword: (v: string) => void

  confirmPassword: string
  setConfirmPassword: (v: string) => void

  lrn: string
  setLrn: (v: string) => void

  sectionId: string
  setSectionId: (v: string) => void

  grades?: any[]
  sectionsLoading?: boolean

  onSubmit: () => void
  loading: boolean
  error?: string | null
}

export function SignupForm({
  role,
  setRole,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  lrn,
  setLrn,
  sectionId,
  setSectionId,
  grades,
  sectionsLoading,
  onSubmit,
  loading,
  error,
  ...props
}: SignupFormProps) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
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
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </Field>

            {role === "student" && (
              <>
                <Field>
                  <FieldLabel htmlFor="lrn">LRN</FieldLabel>
                  <Input id="lrn" value={lrn} onChange={e => setLrn(e.target.value)} />
                </Field>

                <Field>
                  <FieldLabel>Section</FieldLabel>

                  {sectionsLoading ? (
                    <FieldDescription>Loading sections...</FieldDescription>
                  ) : (
                    <select
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value)}
                      className="w-full border rounded p-2"
                    >
                      <option value="">Select section</option>
                      {grades?.map((grade: any) =>
                        grade.sections.map((section: any) => (
                          <option key={section.id} value={section.id}>
                            Grade {grade.level} - {section.name}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                </Field>
              </>
            )}

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Field>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              <FieldDescription className="text-center">
                Already have an account? <a href="/login">Sign in</a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}