/**
 * landing.tsx
 *
 * Public landing page for cLMS.
 * Static page — no API calls.
 * Describes cLMS and Dolores Central School.
 *
 * Links:
 *   /login    → for existing users
 *   /register → for new users
 */

import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className='flex min-h-screen justify-center bg-amber-300'>
      <Card className='flex justify-center h-fit mt-24 p-12'>
         <h1 className='text-3xl font-semibold'>cLMS</h1>
          <h2>Central Learning Management System</h2>
          <p>
            A digital Mathematics learning tool for Grade 4–6 students
            at Dolores Central School.
          </p>
          <p>
            Designed to help teachers manage lessons and track student
            progress, and help students learn at their own pace.
          </p>
       
        <div>
          <Button onClick={() => navigate('/login')}>Login</Button>
          <Button onClick={() => navigate('/register')}>Register</Button>
        </div>
      </Card>

    </div>
  )
}