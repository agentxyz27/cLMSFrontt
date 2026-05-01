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

import { useState } from "react"
import { Popup, Button } from "pixel-retroui"
import Login from "./login"


export default function Landing() {

  const [ isPopupOpen, setIsPopupOpen ] = useState(false)

  const openPopup = () => setIsPopupOpen(true)
  const closePopup = () => setIsPopupOpen(false)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <Button onClick={openPopup}>Open Popup</Button>

      <Popup isOpen={isPopupOpen} onClose={closePopup}>
        <Login />
      </Popup>
      
      <h1>cLMS</h1>
      <h2>Central Learning Management System</h2>
      <p>
        A digital Mathematics learning tool for Grade 4–6 students
        at Dolores Central School.
      </p>
      <p>
        Designed to help teachers manage lessons and track student
        progress, and help students learn at their own pace.
      </p>
    </div>
  )
}