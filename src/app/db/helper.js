
const firstNames = [
  'Aarav','Ishaan','Karan','Rohan','Vikram','Kabir','Ananya','Riya','Simran','Meera',
  'Arjun','Rahul','Dev','Nikhil','Siddharth','Priya','Neha','Shruti','Kavya','Tanvi',
  'Aditi','Pooja','Manoj','Vivek','Harsh','Anil','Suresh','Ramesh','Deepak','Kiran',
  'Sonia','Divya','Lakshmi','Sneha','Ayesha','Zara','Naina','Komal','Parth','Yash'
];

const lastNames = [
  'Sharma','Verma','Patel','Reddy','Gupta','Mehta','Iyer','Agarwal','Malhotra','Nair',
  'Kapoor','Chopra','Singh','Khan','Das','Banerjee','Mukherjee','Ghosh','Joshi','Kulkarni',
  'Menon','Pillai','Bhatia','Oberoi','Desai','Rastogi','Bose','Saxena','Rao','Mishra',
  'Tripathi','Dubey','Srivastava','Pandey','Jain','Kaur','Gill','Sandhu','Sidhu','Ahluwalia'
];

export const randomName = () => {
  const fn = firstNames[randInt(0, firstNames.length - 1)];
  const ln = lastNames[randInt(0, lastNames.length - 1)];
  return `${fn} ${ln}`;
}

export const randomEmail = (name) => {
  const num = randInt(1000, 9999);
  const slug = name.toLowerCase().replace(/\s+/g, '.');
  return `${slug}${num}@gmail.com`;
}

export const randInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const slugify = (s) => {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

export const randomTags = () => {
  const pool = ['frontend', 'backend', 'remote', 'senior', 'junior', 'contract', 'fulltime', 'design'];
  const n = randInt(0, 3);
  const out = new Set();
  for (let i = 0; i < n; i++) out.add(pool[randInt(0, pool.length - 1)]);
  return [...out];
}
