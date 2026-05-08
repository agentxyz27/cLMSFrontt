import { useAuth } from '@/context/authContext'

export default function TeacherDashboard() {
  const { user } = useAuth()

  return (
    <div className='flex flex-col min-h-screen gap-4'>
      <h1 className="text-2xl font-bold">Welcome back, {user?.name ?? 'Teacher'}</h1>

    </div>
  )
}