import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/lib/store"
import { fetchActiveCareServices } from "@/feature/careServices/careServiceSlice"

export const useCareServices = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { careServices, activeCareServices, status, error } = useSelector((state: RootState) => state.careServices)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (isAuthenticated && user && status === "idle") {
      dispatch(fetchActiveCareServices())
    }
  }, [dispatch, isAuthenticated, user, status])

  return { careServices, activeCareServices, status, error }
}