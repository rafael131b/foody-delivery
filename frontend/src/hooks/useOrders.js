import { useEffect, useRef, useState } from 'react'
import { api } from '../api'

const pageSize = 10
const initialPageInfo = {
  page: 0,
  size: pageSize,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
}

export default function useOrders(token) {
  const [orders, setOrders] = useState([])
  const [pageInfo, setPageInfo] = useState(initialPageInfo)
  const [counts, setCounts] = useState({})
  const [filter, setFilter] = useState('TODOS')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshVersion, setRefreshVersion] = useState(0)
  const requestVersion = useRef(0)
  const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0)
  const normalizedSearch = search.trim()

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(normalizedSearch), 300)
    return () => clearTimeout(timeout)
  }, [normalizedSearch])

  useEffect(() => {
    const currentRequest = ++requestVersion.current
    if (normalizedSearch !== debouncedSearch) return
    let active = true

    api
      .orders({ page: pageInfo.page, size: pageSize, status: filter, q: debouncedSearch }, token)
      .then((result) => {
        if (!active || currentRequest !== requestVersion.current) return
        if (!result || !Array.isArray(result.content) || !result.statusCounts) {
          throw new Error('Recebemos uma resposta inesperada. Atualize a página e tente novamente.')
        }
        setOrders(result.content)
        setPageInfo(result)
        setCounts(result.statusCounts)
        setError('')
      })
      .catch((requestError) => {
        if (active && currentRequest === requestVersion.current) setError(requestError.message)
      })
      .finally(() => {
        if (active && currentRequest === requestVersion.current) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [filter, pageInfo.page, refreshVersion, token, normalizedSearch, debouncedSearch])

  const selectSearch = (nextSearch) => {
    setSearch(nextSearch)
    if (nextSearch.trim() === normalizedSearch) return
    requestVersion.current += 1
    setLoading(true)
    setError('')
    setPageInfo((current) => ({ ...current, page: 0 }))
  }

  const selectFilter = (nextFilter) => {
    setLoading(true)
    setError('')
    setFilter(nextFilter)
    setPageInfo((current) => ({ ...current, page: 0 }))
    setRefreshVersion((current) => current + 1)
  }

  const goToPage = (nextPage) => {
    setLoading(true)
    setError('')
    setPageInfo((current) => ({ ...current, page: nextPage }))
  }

  const refresh = () => {
    setLoading(true)
    setError('')
    setRefreshVersion((current) => current + 1)
  }

  const updateStatus = async (id, status) => {
    try {
      await api.updateStatus(id, status, token)
      refresh()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return {
    orders,
    pageInfo,
    counts,
    totalCount,
    filter,
    search,
    error,
    loading,
    selectFilter,
    selectSearch,
    goToPage,
    refresh,
    updateStatus,
  }
}
