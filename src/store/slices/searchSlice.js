import { createSlice } from '@reduxjs/toolkit'

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    query:      '',
    aiResults:  [],
    isAiSearch: false,   // true when results came from AI search endpoint
    isLoading:  false,
    error:      null,
    // Persisted recent searches (up to 6)
    recentSearches: JSON.parse(localStorage.getItem('sc_recent_searches')) || [],
  },
  reducers: {
    setQuery: (state, { payload }) => {
      state.query = payload
    },

    setAiResults: (state, { payload }) => {
      state.aiResults  = payload
      state.isAiSearch = true
      state.isLoading  = false
      state.error      = null
    },

    setLoading: (state, { payload }) => {
      state.isLoading = payload
    },

    setError: (state, { payload }) => {
      state.error     = payload
      state.isLoading = false
    },

    clearResults: (state) => {
      state.aiResults  = []
      state.isAiSearch = false
      state.error      = null
    },

    addRecentSearch: (state, { payload }) => {
      const term = payload.trim()
      if (!term) return
      // Remove duplicate, prepend, cap at 6
      const filtered = state.recentSearches.filter(
        (s) => s.toLowerCase() !== term.toLowerCase()
      )
      state.recentSearches = [term, ...filtered].slice(0, 6)
      localStorage.setItem(
        'sc_recent_searches',
        JSON.stringify(state.recentSearches)
      )
    },

    removeRecentSearch: (state, { payload }) => {
      state.recentSearches = state.recentSearches.filter((s) => s !== payload)
      localStorage.setItem(
        'sc_recent_searches',
        JSON.stringify(state.recentSearches)
      )
    },

    clearRecentSearches: (state) => {
      state.recentSearches = []
      localStorage.removeItem('sc_recent_searches')
    },
  },
})

export const {
  setQuery,
  setAiResults,
  setLoading,
  setError,
  clearResults,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} = searchSlice.actions

export default searchSlice.reducer

// Selectors
export const selectSearchQuery    = (state) => state.search.query
export const selectAiResults      = (state) => state.search.aiResults
export const selectSearchLoading  = (state) => state.search.isLoading
export const selectRecentSearches = (state) => state.search.recentSearches
