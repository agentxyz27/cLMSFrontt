import { useEffect, useState, useCallback } from 'react'
import { templateEngineApi } from '@/shared/api/templateEngineApi'
import type {
  AssignedActivity,
  AssignRemediationPayload,
  AssignmentStatus,
  ClassroomAssignments
} from '@/shared/types'

export function useTemplateEngine(
  classRoomId: number | undefined,
  token: string | null
) {
  const [assignments, setAssignments]   = useState<ClassroomAssignments | null>(null)
  const [loading, setLoading]           = useState(true)
  const [assigning, setAssigning]       = useState(false)
  const [error, setError]               = useState<string | null>(null)

  const fetch = async () => {
    if (!token || !classRoomId) return
    setLoading(true)
    try {
      const res = await templateEngineApi.getClassroomAssignments(classRoomId, token)
      setAssignments(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [classRoomId, token])

  // Teacher clicks "Assign Remediation" on a flagged student
  const assign = useCallback(async (payload: AssignRemediationPayload) => {
    if (!token) return
    setAssigning(true)
    setError(null)
    try {
      const res = await templateEngineApi.assignRemediation(payload, token)
      await fetch()
      return res.activity
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to assign remediation')
    } finally {
      setAssigning(false)
    }
  }, [token])

  // Teacher archives an assignment
  const updateStatus = useCallback(async (
    assignmentId: number,
    status: AssignmentStatus
  ) => {
    if (!token) return
    setError(null)
    try {
      const res = await templateEngineApi.updateStatus(assignmentId, status, token)
      await fetch()
      return res.activity
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update assignment')
    }
  }, [token])

  // Get assignments for a specific student
  const getStudentAssignments = useCallback(async (studentId: number) => {
    if (!token) return
    try {
      return await templateEngineApi.getStudentAssignments(studentId, token)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load student assignments')
    }
  }, [token])

  return {
    assignments,
    loading,
    assigning,
    error,
    refetch: fetch,
    assign,
    updateStatus,
    getStudentAssignments
  }
}