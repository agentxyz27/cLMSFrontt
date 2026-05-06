import {
  LayoutDashboard,
  School,
  LayoutTemplate,
  Plus,
  BarChart2,
} from "lucide-react"

export const teacherNavItems = [
  { label: "Home", icon: LayoutDashboard, path: "/teacher/dashboard" },
  { label: "Classrooms", icon: School, path: "/teacher/classrooms" },
  { label: "New", icon: Plus, path: "/teacher/lessons/new", isAction: true },
  { label: "Templates", icon: LayoutTemplate, path: "/teacher/templates" },
  { label: "Progress", icon: BarChart2, path: "/teacher/progress" },
]