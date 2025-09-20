import React from 'react'
import JobCard from '../components/JobCard'

const LandingPage = () => {
  return (
    <div className='px-18'>
      {/* -------------------------------------Navigation-Bar----------------------------------------------------- */}
      <div className='flex justify-between items-center space-x-6 pt-9'>
        <div className="font-bold text-4xl"><span className='text-accent'>T</span>alent<span className='text-accent'>F</span>low</div>
        <div className="flex items-center justify-center gap-x-14">
          <div>Home</div>
          <div>Find Jobs</div>
          <div>Job Alerts</div>
          <div>Find Candidates</div>
          <div>Career Advice</div>
        </div>
        <div className="px-7 py-4 font-medium text-[1.1rem] bg-primary rounded-full">Login Now</div>
      </div>


      {/* -------------------------------------Hero-Section----------------------------------------------------- */}
      <div>
        <div className='text-center mt-30 text-8xl justify-center font-extrabold'><h1 className='mb-9'>Turning <span className='text-accent'>Potential</span></h1><h1>Into <span className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent'>Performance</span></h1></div>
        <div className='text-center mt-15 text-xl justify-center'><h1><span className='font-medium text-accent'>30,000+</span> companies rely on us! Your dream candidates are waiting</h1></div>
      </div>
      <hr className='h-[0.1rem] mx-40 mt-10 border-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'/>
    
      {/* ------------------------------------------------------------------------------------------ */}
      <div>
        <h1 className="text-4xl my-10 font-bold">Manage Hiring</h1>
        <div>
          <JobCard hello={"d"}/>
        </div>
      </div>
    
    </div>
  )
}

export default LandingPage