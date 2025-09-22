import { http, HttpResponse } from 'msw'
import { db } from '../db/index.js'
import { randomDelay, maybeFail } from './utils.js'


// --- Handlers ---
export const handlers = [

  // GET /jobs?search=&status=&page=&pageSize=&sort=
  http.get('/jobs', async ({ request }) => {
    await randomDelay()
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    const sort = url.searchParams.get('sort') || 'order'

    let jobs = await db.jobs.toArray()
    if (search) jobs = jobs.filter(j => j.title.toLowerCase().includes(search))
    if (status) jobs = jobs.filter(j => j.status === status)
    jobs = jobs.sort((a, b) => (a[sort] > b[sort] ? 1 : -1))

    const start = (page - 1) * pageSize
    const paginated = jobs.slice(start, start + pageSize)

    return HttpResponse.json({ data: paginated, total: jobs.length })
  }),

  // POST /jobs
  http.post('/jobs', async ({ request }) => {
    await randomDelay()
    try {
      maybeFail()
      const body = await request.json()
      const id = await db.jobs.add({
        ...body,
        status: body.status || 'active',
        order: body.order ?? Date.now(), // fallback ordering
      })
      const job = await db.jobs.get(id)
      return HttpResponse.json(job, { status: 201 })
    } catch (err) {
      return HttpResponse.json({ message: err.message }, { status: 500 })
    }
  }),

  // PATCH /jobs/:id
  http.patch('/jobs/:id', async ({ params, request }) => {
    await randomDelay()
    try {
      maybeFail()
      const patch = await request.json()
      await db.jobs.update(Number(params.id), patch)
      const updated = await db.jobs.get(Number(params.id))
      return HttpResponse.json(updated)
    } catch (err) {
      return HttpResponse.json({ message: err.message }, { status: 500 })
    }
  }),

  // PATCH /jobs/:id/reorder
  http.patch('/jobs/:id/reorder', async ({ request }) => {
    await randomDelay()
    try {
      maybeFail()
      const { fromOrder, toOrder } = await request.json()
      const [fromJob] = await db.jobs.where('order').equals(fromOrder).toArray()
      if (fromJob) {
        await db.jobs.update(fromJob.id, { order: toOrder })
      }
      return HttpResponse.json({ success: true })
    } catch (err) {
      return HttpResponse.json({ message: err.message }, { status: 500 })
    }
  }),

  // GET /candidates?search=&stage=&page=
  http.get('/candidates', async ({ request }) => {
    await randomDelay()
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const stage = url.searchParams.get('stage')
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = 10

    let candidates = await db.candidates.toArray()
    if (search) candidates = candidates.filter(c => c.name.toLowerCase().includes(search))
    if (stage) candidates = candidates.filter(c => c.stage === stage)

    const start = (page - 1) * pageSize
    const paginated = candidates.slice(start, start + pageSize)

    return HttpResponse.json({ data: paginated, total: candidates.length })
  }),

  // POST /candidates
  http.post('/candidates', async ({ request }) => {
    await randomDelay()
    try {
      maybeFail()
      const body = await request.json()
      const id = await db.candidates.add({
        ...body,
        stage: body.stage || 'applied',
      })
      const candidate = await db.candidates.get(id)
      return HttpResponse.json(candidate, { status: 201 })
    } catch (err) {
      return HttpResponse.json({ message: err.message }, { status: 500 })
    }
  }),

  // PATCH /candidates/:id
  http.patch('/candidates/:id', async ({ params, request }) => {
    await randomDelay()
    try {
      maybeFail()
      const patch = await request.json()
      await db.candidates.update(Number(params.id), patch)
      const updated = await db.candidates.get(Number(params.id))
      return HttpResponse.json(updated)
    } catch (err) {
      return HttpResponse.json({ message: err.message }, { status: 500 })
    }
  }),

  // GET /candidates/:id/timeline
  http.get('/candidates/:id/timeline', async ({ params }) => {
    await randomDelay()
    const candidateId = Number(params.id)
    const submissions = await db.submissions.where('candidateId').equals(candidateId).toArray()
    return HttpResponse.json(submissions)
  }),

  // GET /assessments/:jobId
  http.get('/assessments/:jobId', async ({ params }) => {
    await randomDelay()
    const jobId = Number(params.jobId)
    const assessments = await db.assessments.where('jobId').equals(jobId).toArray()
    return HttpResponse.json(assessments)
  }),

  // PUT /assessments/:jobId
  http.put('/assessments/:jobId', async ({ params, request }) => {
    await randomDelay()
    try {
      maybeFail()
      const jobId = Number(params.jobId)
      const data = await request.json()
      await db.assessments.where('jobId').equals(jobId).delete()
      const ids = await db.assessments.bulkAdd(data.map(a => ({ ...a, jobId })))
      const stored = await db.assessments.bulkGet(ids)
      return HttpResponse.json(stored)
    } catch (err) {
      return HttpResponse.json({ message: err.message }, { status: 500 })
    }
  }),

  // POST /assessments/:jobId/submit
  http.post('/assessments/:jobId/submit', async ({ params, request }) => {
    await randomDelay()
    try {
      maybeFail()
      const jobId = Number(params.jobId)
      const body = await request.json()
      const id = await db.submissions.add({
        ...body,
        jobId,
        submittedAt: new Date().toISOString(),
      })
      const submission = await db.submissions.get(id)
      return HttpResponse.json(submission, { status: 201 })
    } catch (err) {
      return HttpResponse.json({ message: err.message }, { status: 500 })
    }
  }),
]
