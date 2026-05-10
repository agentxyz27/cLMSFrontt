import {
  LayoutDashboard,
  School,
  UserRound,
  LayoutTemplate,
  BarChart2,
} from "lucide-react"

export const teacherNavItems = [
  { label: "Home", icon: LayoutDashboard, path: "/teacher/dashboard" },
  { label: "Classrooms", icon: School, path: "/teacher/classrooms" },
  { label: "Students", icon: UserRound, path: "/teacher/lessons/new"},
  { label: "Templates", icon: LayoutTemplate, path: "/teacher/templates" },
  { label: "Progress", icon: BarChart2, path: "/teacher/walakapake/1" },
]