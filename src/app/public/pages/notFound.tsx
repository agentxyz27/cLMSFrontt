/**
 * notFound.tsx
 *
 * 404 page — shown when no route matches the URL.
 * Gives the user a way back instead of a dead end.
 */

import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div>
      <h1>404</h1>
      <p>Page not found.</p>
      <button onClick={() => navigate('/')}>Go Home</button>
    </div>
  )
}