import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/authContext"
import { authApi } from "@/shared/api/authApi"
import { useSections } from "@/features/teacher/hooks/useSections"

import { SignupForm } from "@/components/signup-form"

export default function Register() {
  const navigate = useNavigate()
  const { token } = useAuth()

  const [role, setRole] = useState<'student' | 'teacher'>('teacher')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [lrn, setLrn] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { data: grades, loading: sectionsLoading } = useSections(
    role === "student" ? token : null
  )

  async function handleSubmit() {
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      if (role === "teacher") {
        await authApi.registerTeacher({ name, email, password })
      } else {
        if (!sectionId) {
          setError("Please select a section")
          return
        }

        await authApi.registerStudent({
          name,
          email,
          password,
          lrn,
          sectionId,
        })
      }

      navigate("/login")
    } catch (err: any) {
      setError(err?.message ?? "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full items-center justify-center">
      <div className="w-full max-w-md">
        <SignupForm
          className="flex"
          role={role}
          setRole={setRole}

          name={name}
          setName={setName}

          email={email}
          setEmail={setEmail}

          password={password}
          setPassword={setPassword}

          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}

          lrn={lrn}
          setLrn={setLrn}

          sectionId={sectionId}
          setSectionId={setSectionId}

          grades={grades}
          sectionsLoading={sectionsLoading}

          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}