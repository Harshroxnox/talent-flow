// index/db.js
import Dexie from 'dexie';
import { randomName, randomEmail, randInt, slugify, randomTags, randomPhoneNumber, randomDate, randomLocation, randomSkills } from './helper.js';

export const db = new Dexie('JobPortalDB');

// Database Schema
db.version(1).stores({
  jobs: '++id, title, status, order, slug',
  candidates: '++id, name, email, stage, jobId',
  // Add a new 'notes' table
  notes: '++id, candidateId, text, createdAt', 
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
  const locations = [
    "Glendale, CA",
    "Andover, MA",
    "Weston, MA",
    "Austin, TX",
    "Seattle, WA",
    "Boston, MA",
    "San Francisco, CA"
  ];

  const types = ["Full-time", "Part-time", "Intern", "Remote", "Contract"];
  const amounts = [10, 15, 20, 25, 30];

  const descriptions = [
    "Take advantage of a rare opportunity to start from the ground up and build...",
    "Join our dynamic team to work on exciting projects with a collaborative culture.",
    "Lead innovative initiatives and shape the future of our product.",
    "Work in a fast-paced environment where your ideas will have impact from day one.",
    "Collaborate with talented engineers to create cutting-edge technology solutions.",
    "Be part of a company that values creativity, learning, and personal growth.",
    "Drive projects that directly influence our product roadmap and strategy."
  ];

  for (let i = 1; i <= 25; i++) {
    const title = [
      "Frontend Engineer",
      "Backend Engineer",
      "Fullstack Engineer",
      "Product Designer",
      "Data Scientist",
    ][i % 5] + ` ${i}`;

    const status = Math.random() < 0.75 ? "active" : "archived";

    jobs.push({
      title,
      slug: slugify(title),
      status,
      tags: randomTags(),
      order: i,
      location: locations[randInt(0, locations.length - 1)],
      type: types[randInt(0, types.length - 1)],
      amount: amounts[randInt(0, amounts.length - 1)],
      desc: descriptions[randInt(0, descriptions.length - 1)],
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
    const location = randomLocation();

    candidates.push({
        name,
        email,
        stage,
        jobId,
        phone: randomPhoneNumber(),
        appliedDate: randomDate(new Date(2024, 0, 1), new Date()).toISOString(),
        city: location.city,
        country: location.country,
        experience: randInt(0, 10), // Years of experience
        skills: randomSkills(),
    });
  }

  const candidateIds = await db.candidates.bulkAdd(candidates, { allKeys: true });

  // --- FIX: Seed the submissions table for the timeline ---
  const submissions = [];
  for (let i = 0; i < candidateIds.length; i++) {
      const candidateId = candidateIds[i];
      const candidate = candidates[i];
      submissions.push({
          jobId: candidate.jobId,
          candidateId: candidateId,
          submittedAt: candidate.appliedDate, 
      });
  }
  await db.submissions.bulkAdd(submissions);

  // mark seeded
  await db.meta.put({ key: 'seeded', value: true });

}