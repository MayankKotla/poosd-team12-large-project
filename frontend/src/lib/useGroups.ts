// src/lib/useGroups.ts
// Loads the groups I belong to plus a lookup table of users (so member ids can
// be shown as names), and remembers which group is selected on the
// management pages.

import { useCallback, useEffect, useState } from 'react'
import { getUser, listGroups, listUsers } from './api'
import type { Group, User } from './api'

const SELECTED_KEY = 'shiftflow_group'

export function useGroups() {
  const me = getUser()
  const [groups, setGroups] = useState<Group[]>([])
  const [users, setUsers] = useState<Record<string, User>>({})
  const [selectedId, setSelectedIdState] = useState<string>(localStorage.getItem(SELECTED_KEY) || '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const setSelectedId = (id: string) => {
    localStorage.setItem(SELECTED_KEY, id)
    setSelectedIdState(id)
  }

  const reload = useCallback(async () => {
    setError('')
    try {
      const [g, u] = await Promise.all([listGroups(), listUsers()])
      setGroups(g)
      setUsers(Object.fromEntries(u.map((x) => [x.id, x])))
      // keep the selection valid
      setSelectedIdState((current) => {
        const next = g.some((x) => x._id === current) ? current : g[0]?._id || ''
        localStorage.setItem(SELECTED_KEY, next)
        return next
      })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const selected = groups.find((g) => g._id === selectedId) || null
  const isAdmin = (g: Group | null) =>
    !!g && !!me && g.members.some((m) => m.user === me.id && m.role === 'admin')

  return { me, groups, users, selected, selectedId, setSelectedId, isAdmin, loading, error, reload }
}
