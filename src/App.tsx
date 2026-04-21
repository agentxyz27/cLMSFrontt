/**
 * App.tsx
 *
 * Root route tree for cLMS.
 * Defines all routes and their access rules.
 *
 * Route structure:
 *
 *   /                                          → public (anyone)
 *   /login                                     → public (anyone)
 *   /register                                  → public (anyone)
 *   /student/dashboard                         → protected (role === student)
 *   /student/classrooms/:id                    → protected (role === student)
 *   /student/classrooms/:id/lessons/:lessonId  → protected (role === student)
 *   /student/progress                          → protected (role === student)
 *   /student/badges                            → protected (role === student)
 *   /student/leaderboard                       → protected (role === student)
 *   /teacher/dashboard                         → protected (role === teacher)
 *   /teacher/classrooms/:id                    → protected (role === teacher)
 *   /teacher/classrooms/:id/lessons/new        → protected (role === teacher)
 *   /teacher/classrooms/:id/lessons/:lessonId/edit → protected (role === teacher)
 *   *                                          → 404 catch-all
 */

import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/publicLayout'
import StudentLayout from './layouts/studentLayout'
import TeacherLayout from './layouts/teacherLayout'
import ProtectedRoute from './routes/protectedRoute'
import RoleRoute from './routes/roleRoute'

import Landing from './pages/public/landing'
import NotFound from './pages/public/notFound'
import Login from './pages/public/login'
import Register from './pages/public/register'

import StudentDashboard from './pages/student/studentDashboard'
import StudentClassroomDetail from './pages/student/studentClassroomDetail'
import StudentLessonView from './pages/student/studentLessonView'
import StudentProgress from './pages/student/studentProgress'
import StudentBadges from './pages/student/studentBadges'
import StudentLeaderboard from './pages/student/studentLeaderboard'

import TeacherDashboard from './pages/teacher/teacherDashboard'
import TeacherClassroomDetail from './pages/teacher/teacherClassroomDetail'
import TeacherLessonNew from './pages/teacher/teacherLessonNew'
import TeacherLessonEdit from './pages/teacher/teacherLessonEdit'
import TeacherTemplateBrowser from './pages/teacher/teacherTemplateBrowser'

function App() {
  return (
    <Routes>

      {/* ── Public ── accessible by anyone including guests */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* ── Student ── must be logged in AND role === student */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowed="student" />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="classrooms/:id" element={<StudentClassroomDetail />} />
            <Route path="classrooms/:id/lessons/:lessonId" element={<StudentLessonView />} />
            <Route path="progress" element={<StudentProgress />} />
            <Route path="badges" element={<StudentBadges />} />
            <Route path="leaderboard" element={<StudentLeaderboard />} />
          </Route>
        </Route>
      </Route>

      {/* ── Teacher ── must be logged in AND role === teacher */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RoleRoute allowed="teacher" />}>
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="templates" element={<TeacherTemplateBrowser />} />
            <Route path="classrooms/:id" element={<TeacherClassroomDetail />} />
            <Route path="classrooms/:id/lessons/new" element={<TeacherLessonNew />} />
            <Route path="classrooms/:id/lessons/:lessonId/edit" element={<TeacherLessonEdit />} />
          </Route>
        </Route>
      </Route>

      {/* ── 404 ── catches any unmatched route */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  )
}

export default App