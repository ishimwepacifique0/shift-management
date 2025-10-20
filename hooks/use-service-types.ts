import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/store'
import { fetchServiceTypes, fetchActiveServiceTypes } from '@/feature/serviceTypes/serviceTypeSlice'

export function useServiceTypes() {
  const dispatch = useDispatch<AppDispatch>()
  const { serviceTypes, activeServiceTypes, status, error } = useSelector((state: RootState) => state.serviceTypes)

  useEffect(() => {
    dispatch(fetchServiceTypes())
    dispatch(fetchActiveServiceTypes())
  }, [dispatch])

  return {
    serviceTypes,
    activeServiceTypes,
    status,
    error,
  }
}
