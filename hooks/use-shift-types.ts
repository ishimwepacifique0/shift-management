import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/lib/store"
import { fetchActiveShiftTypes, fetchShiftTypes } from "@/feature/shiftTypes/shiftTypeSlice"

export const useShiftTypes = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { shiftTypes, activeShiftTypes, status, error } = useSelector((state: RootState) => state.shiftTypes)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (isAuthenticated && user && status === "idle") {
      dispatch(fetchShiftTypes()) // Fetch all for display
      dispatch(fetchActiveShiftTypes()) // Fetch active for dropdowns
    }
  }, [dispatch, isAuthenticated, user, status])

  return { shiftTypes, activeShiftTypes, status, error }
}
