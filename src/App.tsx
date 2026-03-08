/**
 * App.tsx
 *
 * Root route tree for cLMS.
 * Defines all routes and their access rules.
 *
 * Route structure:
 *
 *   /                        → public (anyone)
 *   /courses                 → public (anyone)
 *   /login                   → public (anyone)
 *   /register                → public (anyone)
 *   /student/dashboard       → protected (logged in + role === student)
 *   /teacher/dashboard       → protected (logged in + role === teacher)
 *   *                        → 404 catch-all
 *
 * Gate layers for protected routes:
 *   ProtectedRoute           → checks token exists
 *     └── RoleRoute          → checks user.role matches
 *           └── Layout       → renders sidebar + outlet
 *                 └── Page   → actual content
 *
 * Adding a new student page:
 *   1. Create the component in src/pages/student/
 *   2. Import it here
 *   3. Add <Route path="pageName" element={<YourPage />} />
 *      inside the /student Route block
 *
 * Adding a new teacher page: same steps inside the /teacher Route block
 */

import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/publicLayout'
import StudentLayout from './layouts/studentLayout'
import TeacherLayout from './layouts/teacherLayout'
import ProtectedRoute from './routes/protectedRoute'
import RoleRoute from './routes/roleRoute'
import Landing from './pages/public/landing'
import Courses from './pages/public/courses'
import Login from './pages/public/login'
import Register from './pages/public/register'
import StudentDashboard from './pages/student/studentDashboard'
import TeacherDashboard from './pages/teacher/teacherDashboard'

function App() {
  return (
    <Routes>

      {/* ── Public ── accessible by anyone including guests */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* ── Student ── must be logged in AND role === student */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowed="student" />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            {/* add student pages here */}
          </Route>
        </Route>
      </Route>

      {/* ── Teacher ── must be logged in AND role === teacher */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowed="teacher" />}>
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route path="dashboard" element={<TeacherDashboard />} />
            {/* add teacher pages here */}
          </Route>
        </Route>
      </Route>

      {/* ── 404 ── catches any unmatched route */}
      <Route path="*" element={<div>404</div>} />

    </Routes>
  )
}

export default App