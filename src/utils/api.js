const ALLOWED_HOST = 'script.google.com'
const BASE_URL = (() => {
  const url = import.meta.env.VITE_APP_SCRIPT_URL || ''
  try {
    const parsed = new URL(url)
    if (parsed.hostname !== ALLOWED_HOST) throw new Error('Invalid host')
    return url
  } catch {
    console.warn('VITE_APP_SCRIPT_URL invalid or missing')
    return ''
  }
})()

const getToken = () => localStorage.getItem('token')

const _cache = {}
const CACHE_TTL = 60000
const CACHE_TTL_LONG = 10 * 60 * 1000

const request = async (params = {}, cacheTTL = 0) => {
  const token = getToken()
  const allParams = { ...params, ...(token ? { token } : {}) }
  Object.keys(allParams).forEach(k => allParams[k] == null && delete allParams[k])
  const query = new URLSearchParams(allParams).toString()

  if (cacheTTL > 0) {
    const cached = _cache[query]
    if (cached && Date.now() - cached.ts < cacheTTL) return cached.data
  }

  const res = await fetch(`${BASE_URL}?${query}`)
  const data = await res.json()
  if (data.status === 'error') throw new Error(data.message)

  if (cacheTTL > 0) _cache[query] = { data, ts: Date.now() }
  return data
}

const invalidateCache = (actionPrefix) => {
  Object.keys(_cache).forEach(k => { if (k.includes(actionPrefix)) delete _cache[k] })
}

const get = (params = {}, cacheTTL = 0) => request(params, cacheTTL)
const post = (body = {}) => request(body)

// ============= AUTH =============
export const login = async (username, password) => {
  return await post({ action: 'login', username, password })
}

// ============= SERVICES =============
export const getServices = async (forceRefresh = false) => {
  if (forceRefresh) invalidateCache('getServices')
  return await get({ action: 'getServices' }, CACHE_TTL_LONG)
}

export const createService = async (serviceData) => {
  const res = await post({ action: 'createService', ...serviceData })
  invalidateCache('getServices')
  return res
}

export const updateService = async (serviceId, serviceData) => {
  const res = await post({ action: 'updateService', serviceId, ...serviceData })
  invalidateCache('getServices')
  return res
}

export const deleteService = async (serviceId) => {
  const res = await post({ action: 'deleteService', serviceId })
  invalidateCache('getServices')
  return res
}

// ============= BARBERS =============
export const getBarbers = async () => {
  return await get({ action: 'getBarbers' }, CACHE_TTL_LONG)
}

export const getBarbersStatus = async () => {
  return await get({ action: 'getBarbersStatus' })
}

export const createBarber = async (barberData) => {
  const res = await post({ action: 'createBarber', ...barberData })
  invalidateCache('getBarbers')
  invalidateCache('getBarbersStatus')
  return res
}

export const updateBarber = async (barberId, barberData) => {
  const res = await post({ action: 'updateBarber', barberId, ...barberData })
  invalidateCache('getBarbers')
  return res
}

export const deleteBarber = async (barberId) => {
  const res = await post({ action: 'deleteBarber', barberId })
  invalidateCache('getBarbers')
  invalidateCache('getBarbersStatus')
  return res
}

export const updateBarberAvailability = async (barberId, isAvailable, statusNote = '') => {
  const res = await post({ action: 'updateBarberAvailability', barberId, isAvailable: String(isAvailable), statusNote })
  invalidateCache('getBarbersStatus')
  invalidateCache('getBarbers')
  return res
}

// ============= SLOTS =============
export const getSlots = async (barberId, date, duration = 30) => {
  return await get({ action: 'getSlots', barberId, date, duration })
}

// ============= BOOKINGS =============
export const createBooking = async (bookingData) => {
  const res = await post({ action: 'createBooking', ...bookingData })
  invalidateCache('getBookings')
  invalidateCache('getDashboardStats')
  return res
}

export const getBookings = async (filters = {}) => {
  return await get({ action: 'getBookings', ...filters }, CACHE_TTL)
}

export const updateBookingStatus = async (bookingId, status) => {
  const res = await post({ action: 'updateBookingStatus', bookingId, status })
  invalidateCache('getBookings')
  invalidateCache('getDashboardStats')
  return res
}

export const deleteBooking = async (bookingId) => {
  const res = await post({ action: 'deleteBooking', bookingId })
  invalidateCache('getBookings')
  invalidateCache('getDashboardStats')
  return res
}

export const deleteBulkBookings = async (status = null) => {
  const res = await post({ action: 'deleteBulkBookings', ...(status ? { status } : {}) })
  invalidateCache('getBookings')
  invalidateCache('getDashboardStats')
  return res
}

// ============= DASHBOARD =============
export const getDashboardStats = async () => {
  return await get({ action: 'getDashboardStats' }, CACHE_TTL)
}

// ============= PROFILE =============
export const updateProfile = async (profileData) => {
  return await post({ action: 'updateProfile', ...profileData })
}

// ============= REVIEWS =============
export const createReview = async (reviewData) => {
  return await post({ action: 'createReview', ...reviewData })
}

export const getReviews = async () => {
  return await get({ action: 'getReviews' }, CACHE_TTL)
}
