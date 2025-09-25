import { http, HttpResponse } from 'msw'
import { db } from '../db/index.js'
import { randomDelay, maybeFail } from './utils.js'
import { slugify } from '../db/helper.js';

// --- Handlers ---
export const handlers = [

  // GET /jobs?search=&status=&page=&pageSize=&sort=&type=&amount=
  http.get('/jobs', async ({ request }) => {
    await randomDelay()
    const url = new URL(request.url)

    // single-value filters
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10')
    const sort = url.searchParams.get('sort') || 'order'

    // multi-value filters
    const types = url.searchParams.getAll('type')
    const amounts = url.searchParams.getAll('amount')

    let jobs = await db.jobs.toArray()

    // search by title
    if (search) {
      jobs = jobs.filter(j => j.title.toLowerCase().includes(search))
    }

    // filter by status
    if (status) {
      jobs = jobs.filter(j => j.status === status)
    }

    // filter by multiple types
    if (types.length > 0) {
      jobs = jobs.filter(j => types.includes(j.type))
    }

    // filter by multiple amounts (cast to string for comparison)
    if (amounts.length > 0) {
      jobs = jobs.filter(j => amounts.includes(String(j.amount)))
    }

    // sorting
    jobs = jobs.sort((a, b) => (a[sort] > b[sort] ? 1 : -1))

    // pagination
    const start = (page - 1) * pageSize
    const paginated = jobs.slice(start, start + pageSize)

    return HttpResponse.json({
      data: paginated,
      total: jobs.length,
    })
  }),

  // POST /jobs - UPDATED with slug validation
  http.post('/jobs', async ({ request }) => {
    await randomDelay()
    try {
      maybeFail()
      const rawBody = await request.json()

      // filter id: null 
      const body = Object.fromEntries(
        Object.entries(rawBody).filter(([_, value]) => value !== null)
      );

      const slug = slugify(body.title);

      // Check for uniqueness
      const existingJob = await db.jobs.where('slug').equals(slug).first();
      if (existingJob) {
        return HttpResponse.json({ message: `A job with the title "${body.title}" already exists.` }, { status: 400 });
      }

      const id = await db.jobs.add({
        ...body,
        slug: slug, // Add the generated slug
        status: body.status || 'active',
        order: body.order ?? Date.now(),
      })
      const job = await db.jobs.get(id)
      return HttpResponse.json(job, { status: 201 })
    } catch (err) {
      return HttpResponse.json({ message: err.message }, { status: 500 })
    }
  }),

  // PATCH /jobs/:id - UPDATED with slug validation
  http.patch('/jobs/:id', async ({ params, request }) => {
    await randomDelay()
    try {
      maybeFail()
      const patch = await request.json()
      const jobId = Number(params.id);

      // If title is being updated, check for slug uniqueness
      if (patch.title) {
        const slug = slugify(patch.title);
        const existingJob = await db.jobs.where('slug').equals(slug).first();
        // Ensure the found job is not the same one we are editing
        if (existingJob && existingJob.id !== jobId) {
          return HttpResponse.json({ message: `A job with the title "${patch.title}" already exists.` }, { status: 400 });
        }
        patch.slug = slug;
      }

      await db.jobs.update(jobId, patch)
      const updated = await db.jobs.get(jobId)
      return HttpResponse.json(updated)
    } catch (err) {
      return HttpResponse.json({ message: err.message }, { status: 500 })
    }
  }),

  // PATCH /jobs/:id/reorder - FIX
  http.patch('/jobs/:id/reorder', async ({ params, request }) => {
    await randomDelay();
    try {
        maybeFail();
        const { fromOrder, toOrder } = await request.json();
        const jobId = Number(params.id);

        const allJobs = await db.jobs.orderBy('order').toArray();
        const [movedJob] = allJobs.splice(fromOrder, 1);
        allJobs.splice(toOrder, 0, movedJob);

        // Update the 'order' property of all affected jobs
        const updates = allJobs.map((job, index) => 
            db.jobs.update(job.id, { order: index })
        );
        
        await Promise.all(updates);

        return HttpResponse.json({ success: true });
    } catch (err) {
        return HttpResponse.json({ message: "Failed to reorder jobs" }, { status: 500 });
    }
  }),

  // GET /candidates?search=&stage=&page=&jobId=&pageSize=
  http.get('/candidates', async ({ request }) => {
    await randomDelay()
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const stage = url.searchParams.get('stage')
    const jobId = url.searchParams.get('jobId')
    const page = parseInt(url.searchParams.get('page') || '1')
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    let candidates = await db.candidates.toArray()
    if (search) candidates = candidates.filter(c => c.name.toLowerCase().includes(search))
    if (stage) candidates = candidates.filter(c => c.stage === stage)
    if (jobId) candidates = candidates.filter(c => c.jobId === Number(jobId))

    const start = (page - 1) * pageSize
    const paginated = candidates.slice(start, start + pageSize)

    return HttpResponse.json({ data: paginated, total: candidates.length })
  }),

    // POST /candidates
    http.post('/candidates', async ({ request }) => {
        await randomDelay();
        try {
        maybeFail();
        const rawBody = await request.json();

        const body = Object.fromEntries(
          Object.entries(rawBody).filter(([_, value]) => value !== null)
        );

        const id = await db.candidates.add({
            ...body,
            jobId: body.jobId || 1, 
            stage: body.stage || 'applied',
            appliedDate: new Date().toISOString(),
            phone: body.phone || '',
            city: body.city || '',
            country: body.country || '',
            experience: Number(body.experience) || 0,
            skills: body.skills || [],
        });
        const candidate = await db.candidates.get(id);
        return HttpResponse.json(candidate, { status: 201 });
        } catch (err) {
          console.error("Error saving candidate:", err);
          return HttpResponse.json({ message: err.message }, { status: 500 });
        }
    }),


    // GET /candidates/:id
    http.get('/candidates/:id', async ({ params }) => {
        await randomDelay();
        try {
          const candidate = await db.candidates.get(Number(params.id));
          if (candidate) {
            return HttpResponse.json(candidate);
          } else {
            return HttpResponse.json({ message: 'Candidate not found' }, { status: 404 });
          }
        } catch (err) {
          return HttpResponse.json({ message: err.message }, { status: 500 });
        }
      }),

  // PATCH /candidates/:id
  http.patch('/candidates/:id', async ({ params, request }) => {
    await randomDelay()
    try {
      maybeFail()
      const patch = await request.json()
      if (patch.experience !== undefined) {
        patch.experience = Number(patch.experience) || 0;
      }
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

  // GET /candidates/:id/notes
  http.get('/candidates/:id/notes', async ({ params }) => {
    await randomDelay();
    const candidateId = Number(params.id);
    const notes = await db.notes.where('candidateId').equals(candidateId).sortBy('createdAt');
    return HttpResponse.json(notes.reverse());
  }),

  // POST /candidates/:id/notes
  http.post('/candidates/:id/notes', async ({ request, params }) => {
    await randomDelay();
    try {
      maybeFail();
      const candidateId = Number(params.id);
      const { text } = await request.json();
      const id = await db.notes.add({
        candidateId,
        text,
        createdAt: new Date().toISOString(),
      });
      const newNote = await db.notes.get(id);
      return HttpResponse.json(newNote, { status: 201 });
    } catch (err) {
      return HttpResponse.json({ message: "Failed to create note" }, { status: 500 });
    }
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