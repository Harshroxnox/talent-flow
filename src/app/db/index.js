// index/db.js
import Dexie from 'dexie';
import { randomName, randomEmail, randInt, slugify, randomTags } from './helper.js';

export const db = new Dexie('JobPortalDB');

// Database Schema
db.version(1).stores({
  jobs: '++id, title, status, order',
  candidates: '++id, name, email, stage, jobId',
  assessments: '++id, jobId, type',
  submissions: '++id, jobId, candidateId, submittedAt',
  meta: 'key' // for storing e.g. seeded=true
});


// Initial seed function 
export async function initDbIfNeeded() {
  // ensure we only seed once
  const meta = await db.meta.get('seeded');
  if (meta && meta.value === true) return;

  // seed jobs
  const jobs = [];
  for (let i = 1; i <= 25; i++) {
    const title = [`Frontend Engineer`, `Backend Engineer`, `Fullstack Engineer`, `Product Designer`, `Data Scientist`][i % 5] + ` ${i}`;
    const status = Math.random() < 0.75 ? 'active' : 'archived';
    jobs.push({
      title,
      slug: slugify(title),
      status,
      tags: randomTags(),
      order: i
    });
  }
  const jobIds = await db.jobs.bulkAdd(jobs, { allKeys: true });

  // seed 1000 candidates randomly assigned
  const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

  const candidates = [];
  for (let i = 0; i < 1000; i++) {
    const name = randomName();
    const email = randomEmail(name);
    const jobId = jobIds[randInt(0, jobIds.length - 1)];
    const stage = stages[randInt(0, stages.length - 1)];
    candidates.push({ name, email, stage, jobId });
  }

  await db.candidates.bulkAdd(candidates);

  // mark seeded
  await db.meta.put({ key: 'seeded', value: true });

}
