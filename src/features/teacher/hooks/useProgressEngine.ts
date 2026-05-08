import { useEffect, useState, useCallback } from 'react'
import { progressEngineApi } from '@/shared/api/progressEngineApi'
import type {
  HeatmapData,
  ClassProgressResult,
  StudentProgressResult,
  ImprovementReport
} from '@/shared/types'

export function useProgressEngine(
  classRoomId: number | undefined,
  lessonId: number | undefined,
  token: string | null
) {
  const [heatmap, setHeatmap]           = useState<HeatmapData | null>(null)
  const [classProgress, setClassProgress] = useState<ClassProgressResult | null>(null)
  const [improvement, setImprovement]   = useState<ImprovementReport | null>(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)

  const fetchAll = async () => {
    if (!token || !classRoomId || !lessonId) return
    setLoading(true)
    try {
      const [heatmapRes, classRes, improvementRes] = await Promise.all([
        progressEngineApi.getHeatmap(classRoomId, token),
        progressEngineApi.getClassProgress(classRoomId, lessonId, token),
        progressEngineApi.getImprovementReport(classRoomId, lessonId, token)
      ])
      setHeatmap(heatmapRes)
      setClassProgress(classRes)
      setImprovement(improvementRes)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [classRoomId, lessonId, token])

  // Fetch progress for a single student — used in drill down view
  const getStudentProgress = useCallback(async (
    studentId: number
  ): Promise<StudentProgressResult | undefined> => {
    if (!token || !classRoomId) return
    try {
      return await progressEngineApi.getStudentProgress(classRoomId, studentId, token)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load student progress')
    }
  }, [token, classRoomId])

  return {
    heatmap,
    classProgress,
    improvement,
    loading,
    error,
    refetch: fetchAll,
    getStudentProgress
  }
}