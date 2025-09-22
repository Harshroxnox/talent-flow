import Dexie from 'dexie';

export const db = new Dexie('JobPortalDB');
db.version(1).stores({
  jobs: '++id, title, status',
  candidates: '++id, name, email, stage, jobId',
  assessments: '++id, jobId, type, question',
});