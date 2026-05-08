import { api } from './api'
import type {
  AssignedActivity,
  AssignRemediationPayload,
  StudentAssignments,
  ClassroomAssignments,
  AssignmentStatus,
} from '../types'
import type { Template } from '../types'

export const templateEngineApi = {
  // Find best matching template for a topic + difficulty
  findTemplate: (topicId: number, token: string, difficulty?: number) =>
    api.get<Template>(
      `/template-engine/find?topicId=${topicId}${difficulty ? `&difficulty=${difficulty}` : ''}`,
      token
    ),

  // Browse all templates for a topic
  getTemplatesByTopic: (topicId: number, token: string) =>
    api.get<{ topic: { id: number; name: string }; total: number; templates: Template[] }>(
      `/template-engine/topic/${topicId}`,
      token
    ),

  // Teacher clicks "Assign Remediation"
  assignRemediation: (payload: AssignRemediationPayload, token: string) =>
    api.post<{ message: string; activity: AssignedActivity }>(
      '/template-engine/assign',
      payload,
      token
    ),

  // Get all assignments for a student
  getStudentAssignments: (studentId: number, token: string) =>
    api.get<StudentAssignments>(
      `/template-engine/assignments/student/${studentId}`,
      token
    ),

  // Get all assignments across a classroom
  getClassroomAssignments: (classRoomId: number, token: string) =>
    api.get<ClassroomAssignments>(
      `/template-engine/assignments/classroom/${classRoomId}`,
      token
    ),

  // Update assignment status — teacher or student
  updateStatus: (assignmentId: number, status: AssignmentStatus, token: string) =>
    api.patch<{ message: string; activity: AssignedActivity }>(
      `/template-engine/assignments/${assignmentId}/status`,
      { status },
      token
    ),
}