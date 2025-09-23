import Sidebar from '../components/Sidebar'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query';
import { fetchJobs } from '../api/jobs';

import createJobImg from "../assets/jobs1.webp"
import teamPlanImg from "../assets/jobs2.jpg"

import JobPortalCard from '../components/JobPortalCard';
import JobFilters from '../components/JobFilters';

const JobsListing = () => {
  // ---- Filters as state ----
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')          // e.g., 'active', 'archived'
  const [types, setTypes] = useState([])           // e.g., ['Full-time', 'Part-time'] //Full-time Part-time Intern Remote Contract
  const [amounts, setAmounts] = useState([])       // e.g., ['10','15','20','25','30']
  const [sort, setSort] = useState('order')        // e.g., 'title', 'order'
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  

  // ---- React Query ----
  const { data, isLoading } = useQuery({
    queryKey: ['jobs', { search, status, types, amounts, page, pageSize, sort }],
    queryFn: () => fetchJobs({ search, status, types, amounts, page, pageSize, sort }),
    keepPreviousData: true,
  })

  console.log(data)

  return (
  <div className='flex h-screen text-[1.1rem]'>
    <Sidebar />

    <div className='ml-61 flex-1 px-15'>



      <div className='flex items-center justify-center gap-5 py-4'>
        <div className='flex bg-secondary p-4 rounded-xl border-[0.01rem] border-[#343434ff]'>
          <div className='flex flex-col gap-1'>
            <h1 className='font-[400]'>Create a Job Post</h1>
            <p className='text-[1rem] pb-2'>Create a post for a full-time or freelance job opportunity and manage all applicants from your direct Jobs inbox.</p>
            <button className='self-start rounded-md text-[1rem] cursor-pointer hover:bg-dark-grey bg-grey text-background font-[400] py-[0.4rem] px-3'>Post a new job</button>
          </div>
          <div className='ml-3 flex items-center justify-center'><img src={createJobImg} alt="" className='h-35 w-115 rounded-lg'/></div>
        </div>

        <div className='flex bg-secondary p-4 rounded-xl border-[0.01rem] border-[#343434ff]'>
          <div className='flex flex-col gap-1'>
            <h1 className='font-[400]'>Unlimited Posting with Team Plan</h1>
            <p className='text-[1rem] pb-2'>Browse, post jobs and connect with top-notch creators and find the perfect candidate for your next project with our team plan.</p>
            <button className='self-start rounded-md text-[1rem] cursor-pointer hover:bg-dark-grey bg-grey text-background font-[400] py-[0.4rem] px-3'>Try Team Plan</button>
          </div>
          <div className='ml-3 flex items-center justify-center'><img src={teamPlanImg} alt="" className='h-35 w-115 rounded-lg'/></div>
        </div>
      </div>

      <JobFilters
        search={search} setSearch={setSearch}
        status={status} setStatus={setStatus}
        types={types} setTypes={setTypes}
        amounts={amounts} setAmounts={setAmounts}
        sort={sort} setSort={setSort}
      />


      <div className='grid grid-cols-3 gap-5'>
          {
            data?.data.map((job) => (
              <JobPortalCard
                title={job.title} status={job.status}
                desc={job.desc}
                location={job.location} type={job.type} amount={job.amount} 
              />
            ))
          }
      </div>

    </div>
  </div>
  )
}

export default JobsListing