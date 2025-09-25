// index/db.js
import Dexie from 'dexie';
import { randomName, randomEmail, randInt, slugify, randomTags, randomPhoneNumber, randomDate, randomLocation, randomSkills } from './helper.js';

export const db = new Dexie('JobPortalDB');

// Database Schema
db.version(1).stores({
  jobs: '++id, title, status, order, slug',
  candidates: '++id, name, email, stage, jobId',
  notes: '++id, candidateId, text, createdAt',
  assessments: '++id, jobId, type, title, createdAt, updatedAt',
  assessmentDrafts: '++id, jobId, title, data, lastModified',
  candidateResponses: '++id, assessmentId, candidateId, responses, isSubmitted, lastModified',
  persistentState: 'key, value, timestamp', // for general state persistence
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

  // --- Seed Assessments ---
  const assessments = [
    // Assessment 1: Frontend Engineer
    {
      jobId: jobIds[0],
      title: 'Frontend Engineer Skills Assessment',
      description: 'An assessment to evaluate core frontend development skills.',
      sections: [
        {
          id: 1,
          title: 'JavaScript Fundamentals',
          description: 'Questions about core JavaScript concepts.',
          questions: [
            { id: 101, type: 'single-choice', text: 'What is the difference between `let`, `const`, and `var`?', options: ['Scope', 'Hoisting', 'Re-assignability', 'All of the above'], validation: { required: true } },
            { id: 102, type: 'long-text', text: 'Explain event delegation in JavaScript.', validation: { required: true } },
            { id: 103, type: 'short-text', text: 'What does the `this` keyword refer to in an arrow function?', validation: { required: true } },
            { id: 104, type: 'multiple-choice', text: 'Which of the following are valid ways to create an object in JavaScript?', options: ['Object literal', 'Constructor function', 'Object.create()', 'Class syntax'], validation: { required: true } },
            { id: 105, type: 'numeric', text: 'What will be the output of `console.log(0.1 + 0.2 === 0.3)`?', validation: { required: true } },
          ],
        },
        {
          id: 2,
          title: 'React and Frameworks',
          description: 'Questions about React and modern frontend frameworks.',
          questions: [
            { id: 201, type: 'long-text', text: 'Describe the virtual DOM in React.', validation: { required: true } },
            { id: 202, type: 'single-choice', text: 'What is the purpose of `useEffect` hook in React?', options: ['State management', 'Side effects', 'Component rendering', 'Event handling'], validation: { required: true } },
            { id: 203, type: 'short-text', text: 'What is JSX?', validation: { required: true } },
            { id: 204, type: 'multiple-choice', text: 'Which of the following are state management libraries for React?', options: ['Redux', 'MobX', 'Zustand', 'jQuery'], validation: { required: true } },
            { id: 205, type: 'file-upload', text: 'Upload a screenshot of a React component you are proud of.', validation: { acceptedTypes: '.png,.jpg' } },
          ],
        },
      ],
      settings: { timeLimit: 60, randomizeQuestions: false, showResults: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Assessment 2: Backend Engineer
    {
      jobId: jobIds[1],
      title: 'Backend Engineer Skills Assessment',
      description: 'An assessment to evaluate core backend development skills.',
      sections: [
        {
          id: 3,
          title: 'Node.js and APIs',
          description: 'Questions about Node.js and building APIs.',
          questions: [
            { id: 301, type: 'long-text', text: 'Explain the Node.js event loop.', validation: { required: true } },
            { id: 302, type: 'single-choice', text: 'What is the purpose of Express.js?', options: ['Database ORM', 'Web framework', 'Testing library', 'Task runner'], validation: { required: true } },
            { id: 303, type: 'short-text', text: 'What is middleware in the context of Express.js?', validation: { required: true } },
            { id: 304, type: 'multiple-choice', text: 'Which of the following are valid HTTP methods?', options: ['GET', 'POST', 'PUSH', 'PULL'], validation: { required: true } },
            { id: 305, type: 'numeric', text: 'What status code indicates a successful resource creation?', validation: { required: true } },
          ],
        },
        {
          id: 4,
          title: 'Databases',
          description: 'Questions about databases and data modeling.',
          questions: [
            { id: 401, type: 'long-text', text: 'What is the difference between SQL and NoSQL databases?', validation: { required: true } },
            { id: 402, type: 'single-choice', text: 'What is an index in a database?', options: ['A table column', 'A data structure for fast lookups', 'A type of join', 'A foreign key'], validation: { required: true } },
            { id: 403, type: 'short-text', text: 'What is database normalization?', validation: { required: true } },
            { id: 404, type: 'multiple-choice', text: 'Which of the following are examples of NoSQL databases?', options: ['MongoDB', 'PostgreSQL', 'Redis', 'MySQL'], validation: { required: true } },
            { id: 405, type: 'file-upload', text: 'Upload an ERD for a simple blog application.', validation: { acceptedTypes: '.pdf,.png' } },
          ],
        },
      ],
      settings: { timeLimit: 60, randomizeQuestions: false, showResults: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    // Assessment 3: Product Designer
    {
      jobId: jobIds[3],
      title: 'Product Designer Skills Assessment',
      description: 'An assessment to evaluate product design skills.',
      sections: [
        {
          id: 5,
          title: 'UX/UI Principles',
          description: 'Questions about user experience and user interface design principles.',
          questions: [
            { id: 501, type: 'long-text', text: 'What is the difference between UX and UI design?', validation: { required: true } },
            { id: 502, type: 'single-choice', text: 'What is a user persona?', options: ['A user interview script', 'A fictional character representing a target user', 'A usability testing report', 'A wireframe'], validation: { required: true } },
            { id: 503, type: 'short-text', text: 'What are Nielsen\'s 10 usability heuristics?', validation: { required: true } },
            { id: 504, type: 'multiple-choice', text: 'Which of the following are common UX research methods?', options: ['User interviews', 'Surveys', 'A/B testing', 'Code review'], validation: { required: true } },
            { id: 505, type: 'numeric', text: 'What is the ideal line length for readability in web design (in characters)?', validation: { required: true } },
          ],
        },
        {
          id: 6,
          title: 'Design Tools and Process',
          description: 'Questions about design tools and the design process.',
          questions: [
            { id: 601, type: 'long-text', text: 'Describe your design process from concept to handoff.', validation: { required: true } },
            { id: 602, type: 'single-choice', text: 'What is a design system?', options: ['A collection of reusable components', 'A style guide', 'A component library', 'All of the above'], validation: { required: true } },
            { id: 603, type: 'short-text', text: 'What is the purpose of wireframing?', validation: { required: true } },
            { id: 604, type: 'multiple-choice', text: 'Which of the following are popular design tools?', options: ['Figma', 'Sketch', 'Adobe XD', 'Microsoft Word'], validation: { required: true } },
            { id: 605, type: 'file-upload', text: 'Upload a link to your portfolio.', validation: { required: true } },
          ],
        },
      ],
      settings: { timeLimit: 60, randomizeQuestions: false, showResults: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
  ];

  await db.assessments.bulkAdd(assessments);

  // mark seeded
  await db.meta.put({ key: 'seeded', value: true });

}