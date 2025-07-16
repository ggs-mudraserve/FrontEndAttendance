import { useQuery } from '@tanstack/react-query'
import { fetchEmployees } from '../services/supabase'

export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: fetchEmployees,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onSuccess: (data) => {
      console.log('useEmployees success:', data?.length)
    },
    onError: (error) => {
      console.error('useEmployees error:', error)
    }
  })
}