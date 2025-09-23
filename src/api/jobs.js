import axios from 'axios'

export async function fetchJobs(filters) {
  const params = new URLSearchParams()

  // single-value filters
  if (filters.search) params.append('search', filters.search)
  if (filters.status) params.append('status', filters.status)
  params.append('page', filters.page || 1)
  params.append('pageSize', filters.pageSize || 10)
  params.append('sort', filters.sort || 'order')

  // multi-value filters
  filters.types?.forEach(t => params.append('type', t))
  filters.amounts?.forEach(a => params.append('amount', a))

  const res = await axios.get(`/jobs?${params.toString()}`)
  return res.data
}

export const createJob = async (jobData) => {
  const { data } = await axios.post('/jobs', jobData)
  return data
}

export const updateJob = async ({ id, ...jobData }) => {
  const { data } = await axios.patch(`/jobs/${id}`, jobData)
  return data
}
