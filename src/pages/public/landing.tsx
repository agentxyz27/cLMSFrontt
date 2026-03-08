import { useEffect } from 'react'
import { api } from '../../api/api'

export default function Landing() {
  useEffect(() => {
    api.get('/health').then(console.log).catch(console.error)
  }, [])

  return <div>Landing</div>
}