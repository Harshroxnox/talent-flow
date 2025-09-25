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

    // Get both published assessments and drafts
    const assessments = await db.assessments.where('jobId').equals(jobId).toArray()
    const drafts = await db.assessmentDrafts.where('jobId').equals(jobId).toArray()

    console.log(`📊 GET /assessments/${jobId} - Found ${assessments.length} published, ${drafts.length} drafts`)

    // Convert drafts to assessment format for compatibility
    const draftAssessments = drafts.map(draft => {
      const parsed = JSON.parse(draft.data)
      return {
        ...parsed,
        // Keep the original assessment ID from the parsed data, not the draft table ID
        id: parsed.id,
        isDraft: true,
        lastModified: draft.lastModified,
        draftTableId: draft.id // Keep reference to draft table ID for debugging
      }
    })

    console.log('📋 Returning assessments:', {
      published: assessments.length,
      drafts: draftAssessments.length,
      draftIds: draftAssessments.map(d => d.id)
    })

    return HttpResponse.json([...assessments, ...draftAssessments])
  }),

  // GET /assessments (get all assessments from all jobs)
  http.get('/assessments', async () => {
    await randomDelay()

    // Get all published assessments
    const assessments = await db.assessments.toArray()

    // Get all drafts
    const drafts = await db.assessmentDrafts.toArray()

    // Convert drafts to assessment format
    const draftAssessments = drafts.map(draft => {
      const parsed = JSON.parse(draft.data)
      return {
        ...parsed,
        id: parsed.id,
        isDraft: true,
        lastModified: draft.lastModified,
        draftTableId: draft.id
      }
    })

    return HttpResponse.json([...assessments, ...draftAssessments])
  }),

  // PUT /assessments/:jobId (for saving completed assessments)
  http.put('/assessments/:jobId', async ({ params, request }) => {
    await randomDelay()
    console.log('🚀 PUT /assessments/:jobId handler called')
    try {
      maybeFail()
      const jobId = Number(params.jobId)
      const data = await request.json()
      console.log('📊 Publishing data received:', data)

      // Handle array of assessments
      const assessmentsToSave = Array.isArray(data) ? data : [data]
      console.log('📋 Assessments to save:', assessmentsToSave.length)

      // Add timestamps and jobId to each assessment
      const timestampedAssessments = assessmentsToSave.map(assessment => ({
        ...assessment,
        jobId,
        createdAt: assessment.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))

      const results = []
      for (const assessment of timestampedAssessments) {
        console.log(`💾 Processing assessment ${assessment.id} for job ${jobId}`)
        if (assessment.id) {
          // Check if assessment exists
          const existing = await db.assessments.get(assessment.id)
          if (existing) {
            // Update existing
            await db.assessments.update(assessment.id, assessment)
            const updated = await db.assessments.get(assessment.id)
            results.push(updated)
            console.log(`✏️ Updated existing assessment ${assessment.id}`)
          } else {
            // Add new assessment with existing ID
            const id = await db.assessments.add(assessment)
            const stored = await db.assessments.get(id)
            results.push(stored)
            console.log(`➕ Added new assessment ${assessment.id}`)
          }

          // IMPORTANT: Remove from drafts table if it exists there
          // This handles draft-to-published transitions
          console.log(`🔍 Looking for draft to delete for assessment ${assessment.id} in job ${jobId}`)

          const existingDraft = await db.assessmentDrafts
            .where('jobId')
            .equals(jobId)
            .and(draft => {
              try {
                const parsed = JSON.parse(draft.data)
                const matches = parsed.id === assessment.id
                console.log(`🔍 Checking draft ${draft.id}: parsed.id=${parsed.id}, assessment.id=${assessment.id}, matches=${matches}`)
                return matches
              } catch (err) {
                console.log(`❌ Error parsing draft ${draft.id}:`, err)
                return false
              }
            })
            .first()

          if (existingDraft) {
            console.log(`🗑️ Deleting draft ${existingDraft.id} for published assessment ${assessment.id}`)
            await db.assessmentDrafts.delete(existingDraft.id)
            console.log(`✅ Removed draft ${existingDraft.id} for published assessment ${assessment.id}`)

            // Verify deletion
            const verifyDeleted = await db.assessmentDrafts.get(existingDraft.id)
            console.log(`🔍 Verification - draft ${existingDraft.id} exists after deletion:`, !!verifyDeleted)
          } else {
            console.log(`ℹ️  No existing draft found for assessment ${assessment.id} in job ${jobId}`)
          }
        } else {
          // Add new assessment without ID
          const id = await db.assessments.add(assessment)
          const stored = await db.assessments.get(id)
          results.push(stored)
          console.log(`➕ Added new assessment without ID, got ID ${id}`)
        }
      }

      console.log('🎯 Final results to return:', results)
      return HttpResponse.json(results)
    } catch (err) {
      console.error('❌ Error in PUT /assessments/:jobId:', err)
      return HttpResponse.json({ message: err.message }, { status: 500 })
    }
  }),

  // POST /assessments/:jobId/draft (for saving drafts)
  http.post('/assessments/:jobId/draft', async ({ params, request }) => {
    await randomDelay()
    try {
      maybeFail()
      const jobId = Number(params.jobId)
      const assessmentData = await request.json()

      // Check if a draft already exists for this assessment
      const existingDraft = await db.assessmentDrafts
        .where('jobId')
        .equals(jobId)
        .and(draft => {
          try {
            const parsed = JSON.parse(draft.data)
            return parsed.id === assessmentData.id
          } catch {
            return false
          }
        })
        .first()

      const draftEntry = {
        jobId,
        data: JSON.stringify(assessmentData),
        lastModified: new Date().toISOString()
      }

      let result
      if (existingDraft) {
        // Update existing draft
        await db.assessmentDrafts.update(existingDraft.id, draftEntry)
        result = await db.assessmentDrafts.get(existingDraft.id)
        console.log(`📝 Updated existing draft ${existingDraft.id} for assessment ${assessmentData.id}`)
      } else {
        // Create new draft
        const id = await db.assessmentDrafts.add(draftEntry)
        result = await db.assessmentDrafts.get(id)
        console.log(`📝 Created new draft ${id} for assessment ${assessmentData.id}`)
      }

      return HttpResponse.json(result, { status: 201 })
    } catch (err) {
      console.error('Draft save error:', err)
      return HttpResponse.json({ message: err.message }, { status: 500 })
    }
  }),

  // DELETE /assessments/:jobId/draft/:assessmentId (for deleting drafts)
  http.delete('/assessments/:jobId/draft/:assessmentId', async ({ params }) => {
    await randomDelay()
    try {
      const jobId = Number(params.jobId)
      const assessmentId = Number(params.assessmentId)

      const existingDraft = await db.assessmentDrafts
        .where('jobId')
        .equals(jobId)
        .and(draft => {
          try {
            const parsed = JSON.parse(draft.data)
            return parsed.id === assessmentId
          } catch {
            return false
          }
        })
        .first()

      if (existingDraft) {
        await db.assessmentDrafts.delete(existingDraft.id)
        console.log(`🗑️ Deleted draft ${existingDraft.id} for assessment ${assessmentId}`)
        return HttpResponse.json({ message: 'Draft deleted successfully' })
      } else {
        return HttpResponse.json({ message: 'Draft not found' }, { status: 404 })
      }
    } catch (err) {
      console.error('Draft delete error:', err)
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
