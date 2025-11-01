'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase-client'
import { Resource, ResourceFilters } from '../types/resources'

export function useResources(filters?: ResourceFilters) {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchResources = async () => {
    try {
      setLoading(true)
      setError(null)

      // @ts-ignore - Resources table types not yet generated
      let query = supabase
        .from('resources')
        .select('*')
        .eq('is_published', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category)
      }

      if (filters?.instrument) {
        query = query.eq('instrument', filters.instrument)
      }

      if (filters?.skill_level && filters.skill_level !== 'all') {
        query = query.or(`skill_level.eq.${filters.skill_level},skill_level.eq.all`)
      }

      if (filters?.featured) {
        query = query.eq('is_featured', true)
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setResources(data || [])
    } catch (err) {
      console.error('Error fetching resources:', err)
      setError(err instanceof Error ? err.message : 'Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [filters?.category, filters?.instrument, filters?.skill_level, filters?.search, filters?.featured])

  return { resources, loading, error, refetch: fetchResources }
}

export function useResource(id: string) {
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true)
        setError(null)

        // @ts-ignore - Resources table types not yet generated
        const { data, error: fetchError } = await supabase
          .from('resources')
          .select('*')
          .eq('id', id)
          .eq('is_published', true)
          .single()

        if (fetchError) throw fetchError

        setResource(data)

        // Increment view count
        if (data) {
          // @ts-ignore - Resources table types not yet generated
          await supabase
            .from('resources')
            // @ts-ignore - Resources table types not yet generated
            .update({ views_count: (data.views_count || 0) + 1 })
            .eq('id', id)
        }
      } catch (err) {
        console.error('Error fetching resource:', err)
        setError(err instanceof Error ? err.message : 'Failed to load resource')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchResource()
    }
  }, [id])

  return { resource, loading, error }
}
