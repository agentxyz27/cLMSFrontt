import { Outlet } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function PublicLayout() {
  const navigate = useNavigate()

  return (
    <div>
      <Card 
      className='fixed py-4 p-4 flex-row top-0 right-0 left-0 rounded-none justify-between'
      >
        <div>
          <Button variant="link" onClick={() => navigate('/')}> Home </Button>
          <Button variant="link" onClick={() => navigate('/about')}> About </Button>
        </div>
        <h1 className='mt-2'> Central Learning Management System</h1>
        <div>
          <Button onClick={() => navigate('/login')}> Login </Button>
          <Button onClick={() => navigate('/register')}> Register </Button>
        </div>
      </Card>

      <main>
        <Outlet />
      </main>
    </div>
  )
}