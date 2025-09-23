import Sidebar from '../components/Sidebar'
import { useEffect } from 'react'
import axios from 'axios';

import createJobImg from "../assets/jobs1.webp"
import teamPlanImg from "../assets/jobs2.jpg"

import JobPortalCard from '../components/JobPortalCard';

const JobsListing = () => {

  return (
  <div className='flex h-screen text-[1.1rem]'>
    <Sidebar />

    <div className='flex-1 px-15'>

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


      <div>
          <JobPortalCard
            title="Product Designer" status="active"
            desc="The Sr Product designer will be responsible for creating production assets.."
            location="Andover, MA" type="Remote" amount="25" 
          />
      </div>

    </div>
  </div>
  )
}

export default JobsListing