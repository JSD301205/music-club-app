/**
 * Custom hooks for Bands and Team Members
 * Fetches data from Supabase database
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/lib/supabase-client'
import type {
  Band,
  BandWithMembers,
  TeamMember,
  BandsFilter,
  TeamMembersFilter,
} from '@/app/types/bands-team.types'

const supabase = createClient()

// =============================
// BANDS HOOKS
// =============================

/**
 * Fetch all bands with optional filtering
 */
export function useBands(filter: BandsFilter = {}) {
  const [bands, setBands] = useState<Band[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBands()
  }, [filter.is_published, filter.search])

  const fetchBands = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('bands')
        .select('*')
        .order('order', { ascending: true })

      // Apply filters
      if (filter.is_published !== undefined) {
        query = query.eq('is_published', filter.is_published)
      }

      if (filter.search) {
        query = query.or(`name.ilike.%${filter.search}%,description.ilike.%${filter.search}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setBands(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching bands:', err)
    } finally {
      setLoading(false)
    }
  }

  return { bands, loading, error, refetch: fetchBands }
}

/**
 * Fetch a single band with all its members
 */
export function useBand(bandId: number | null) {
  const [band, setBand] = useState<BandWithMembers | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (bandId !== null) {
      fetchBand()
    }
  }, [bandId])

  const fetchBand = async () => {
    if (bandId === null) return

    try {
      setLoading(true)
      setError(null)

      // @ts-ignore - Supabase types
      const { data, error: fetchError } = await supabase
        .from('bands')
        .select(`
          *,
          band_members (
            *
          )
        `)
        .eq('id', bandId)
        .single()

      if (fetchError) throw fetchError

      // Sort band members by order
      if (data && (data as any).band_members) {
        (data as any).band_members.sort((a: any, b: any) => a.order - b.order)
      }

      setBand(data as BandWithMembers)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching band:', err)
    } finally {
      setLoading(false)
    }
  }

  return { band, loading, error, refetch: fetchBand }
}

/**
 * Fetch all bands with their members
 */
export function useBandsWithMembers(filter: BandsFilter = {}) {
  const [bands, setBands] = useState<BandWithMembers[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBandsWithMembers()
  }, [filter.is_published, filter.search])

  const fetchBandsWithMembers = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('bands')
        .select(`
          *,
          band_members (
            *
          )
        `)
        .order('order', { ascending: true })

      // Apply filters
      if (filter.is_published !== undefined) {
        query = query.eq('is_published', filter.is_published)
      }

      if (filter.search) {
        query = query.or(`name.ilike.%${filter.search}%,description.ilike.%${filter.search}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Sort band members within each band
      const bandsWithSortedMembers = (data || []).map((band: any) => ({
        ...band,
        band_members: (band.band_members || []).sort((a: any, b: any) => a.order - b.order)
      }))

      setBands(bandsWithSortedMembers as BandWithMembers[])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching bands with members:', err)
    } finally {
      setLoading(false)
    }
  }

  return { bands, loading, error, refetch: fetchBandsWithMembers }
}

// =============================
// TEAM MEMBERS HOOKS
// =============================

/**
 * Fetch team members with optional filtering
 */
export function useTeamMembers(filter: TeamMembersFilter = {}) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeamMembers()
  }, [filter.year, filter.category, filter.is_published, filter.search])

  const fetchTeamMembers = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('team_members')
        .select('*')
        .order('order', { ascending: true })

      // Apply filters
      if (filter.year !== undefined) {
        query = query.eq('year', filter.year)
      }

      if (filter.category) {
        query = query.eq('category', filter.category)
      }

      if (filter.is_published !== undefined) {
        query = query.eq('is_published', filter.is_published)
      }

      if (filter.search) {
        query = query.or(`name.ilike.%${filter.search}%,bio.ilike.%${filter.search}%,position.ilike.%${filter.search}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      setTeamMembers(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching team members:', err)
    } finally {
      setLoading(false)
    }
  }

  return { teamMembers, loading, error, refetch: fetchTeamMembers }
}

/**
 * Fetch team members grouped by category for a specific year
 */
export function useTeamByYear(year: number) {
  const [teamData, setTeamData] = useState<{
    cores: TeamMember[]
    coordinators: TeamMember[]
    crew: TeamMember[]
    mentors: TeamMember[]
  }>({
    cores: [],
    coordinators: [],
    crew: [],
    mentors: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeamByYear()
  }, [year])

  const fetchTeamByYear = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('team_members')
        .select('*')
        .eq('year', year)
        .eq('is_published', true)
        .order('order', { ascending: true })

      if (fetchError) throw fetchError

      // Group by category
      const grouped = {
        cores: (data || []).filter((m: TeamMember) => m.category === 'core'),
        coordinators: (data || []).filter((m: TeamMember) => m.category === 'coordinator'),
        crew: (data || []).filter((m: TeamMember) => m.category === 'crew'),
        mentors: (data || []).filter((m: TeamMember) => m.category === 'mentor')
      }

      setTeamData(grouped)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching team by year:', err)
    } finally {
      setLoading(false)
    }
  }

  return { ...teamData, loading, error, refetch: fetchTeamByYear }
}

/**
 * Fetch a single team member by ID
 */
export function useTeamMember(memberId: number | null) {
  const [member, setMember] = useState<TeamMember | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (memberId !== null) {
      fetchMember()
    }
  }, [memberId])

  const fetchMember = async () => {
    if (memberId === null) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', memberId)
        .single()

      if (fetchError) throw fetchError

      setMember(data)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching team member:', err)
    } finally {
      setLoading(false)
    }
  }

  return { member, loading, error, refetch: fetchMember }
}
