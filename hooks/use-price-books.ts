import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '@/lib/store'
import { fetchPriceBooks, fetchActivePriceBooks } from '@/feature/priceBooks/priceBookSlice'

export function usePriceBooks() {
  const dispatch = useDispatch<AppDispatch>()
  const { priceBooks, activePriceBooks, status, error } = useSelector((state: RootState) => state.priceBooks)

  useEffect(() => {
    dispatch(fetchPriceBooks())
    dispatch(fetchActivePriceBooks())
  }, [dispatch])

  return {
    priceBooks,
    activePriceBooks,
    status,
    error,
  }
}
