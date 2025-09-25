import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../app/queryClient';
import toast from 'react-hot-toast';

import { fetchJobs, createJob, updateJob } from '../api/jobs';

import createJobImg from "../assets/jobs1.webp"
import teamPlanImg from "../assets/jobs2.jpg"

import Sidebar from '../components/Sidebar'
import JobPortalCard from '../components/JobPortalCard';
import JobFilters from '../components/JobFilters';
import BtnWhite from '../components/BtnWhite';
import Pagination from '../components/Pagination';
import JobFormModal from '../components/JobFormModal';

const JobsListing = () => {
  // ---- Filters as state ----
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')          // e.g., 'active', 'archived'
  const [types, setTypes] = useState([])           // e.g., ['Full-time', 'Part-time'] //Full-time Part-time Intern Remote Contract
  const [amounts, setAmounts] = useState([])       // e.g., ['10','15','20','25','30']
  const [sort, setSort] = useState('order')        // e.g., 'title', 'order'
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  
  // ---- Modal State ----
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null); // null for create, job object for edit

  // ---- React Query for Fetching jobs ----
  const { data, isFetching } = useQuery({
    queryKey: ['jobs', { search, status, types, amounts, page, pageSize, sort }],
    queryFn: () => fetchJobs({ search, status, types, amounts, page, pageSize, sort }),
    keepPreviousData: true,
  })

  // ---- React Query Mutation for Creating/Updating a Job ----
  const { mutate: saveJob, isLoading: isSaving } = useMutation({
    mutationFn: (jobData) => {
      return jobData.id ? updateJob(jobData) : createJob(jobData);
    },
    onSuccess: (data) => {
      toast.success(`Job "${data.title}" has been saved successfully!`);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsModalOpen(false);
      setEditingJob(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to save the job. Please try again.");
    },
  });

  // ---- React Query Mutation for Archiving/Unarchiving a Job ----
  const { mutate: toggleArchiveJob } = useMutation({
    mutationFn: (job) => updateJob({ 
      id: job.id, 
      status: job.status === 'active' ? 'archived' : 'active' 
    }),
    onSuccess: (_, variables) => {
      const action = variables.status === 'active' ? 'Archived' : 'Unarchived';
      toast.success(`Job "${variables.title}" has been ${action.toLowerCase()}!`);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error, variables) => {
      const action = variables.status === 'active' ? 'Archive' : 'Unarchive';
      toast.error(`Failed to ${action.toLowerCase()} job. Please try again.`);
    },
  });

  // ---- Handlers for Modal and Forms ----
  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setIsModalOpen(true);
  };


  return (<>
  <div className='flex h-screen text-[1.1rem]'>
    <Sidebar />

    <div className='ml-61 flex-1 px-15'>

      <div className='flex items-center justify-center gap-5 py-4'>
        <div className='flex bg-secondary p-4 rounded-xl border-[0.01rem] border-[#343434ff]'>
          <div className='flex flex-col gap-1'>
            <h1 className='font-[400]'>Create a Job Post</h1>
            <p className='text-[1rem] pb-2'>Create a post for a full-time or freelance job opportunity and manage all applicants from your direct Jobs inbox.</p>
            <div onClick={handleOpenCreateModal}><BtnWhite label="Post a new job"/></div>
          </div>
          <div className='ml-3 flex items-center justify-center'><img src={createJobImg} alt="" className='h-35 w-115 rounded-lg'/></div>
        </div>

        <div className='flex bg-secondary p-4 rounded-xl border-[0.01rem] border-[#343434ff]'>
          <div className='flex flex-col gap-1'>
            <h1 className='font-[400]'>Unlimited Posting with Team Plan</h1>
            <p className='text-[1rem] pb-2'>Browse, post jobs and connect with top-notch creators and find the perfect candidate for your next project with our team plan.</p>
            <BtnWhite label="Try Team Plan" />
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


      {isFetching ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ):(
        <div className='grid grid-cols-3 gap-5'>
          {
            data && data.data && data.data.map((job) => (
              <JobPortalCard
                key={job.id}
                job={job}
                onEdit={handleOpenEditModal}
                onToggleArchive={toggleArchiveJob}
              />
            ))
          }
        </div>
      )}

      {
        !isFetching && data && (
          <div className='flex items-center justify-center pb-5'>
            <Pagination 
              page={page} setPage={setPage}
              pageSize={pageSize} setPageSize={setPageSize}
              totalItems={data.total}
            />
          </div>
        )
      }

    </div>
  </div>

  <JobFormModal 
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onSubmit={saveJob}
    isSubmitting={isSaving}
    jobToEdit={editingJob}
  />

  </>)
}

export default JobsListing