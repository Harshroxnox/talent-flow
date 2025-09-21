import React from 'react'
import JobCard from '../components/JobCard'
import microsoft from '../assets/microsoft.webp'
import behance from '../assets/behance.jpg'
import mailchimp from '../assets/mailchimp.png'

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
    
      {/* --------------------------------------Job-Board------------------------------------------------ */}
      <div>
        <h1 className="text-4xl my-10 font-bold">Manage Hiring</h1>
        <div className='flex items-center justify-between'>
          <JobCard 
            role="Senior UI Designer" company="Microsoft" bg="bg-secondary"
            desc="Take advantage of a rare opportunity to start from the ground up and build.."
            location="Glendale, CA" type="Full-time" salary="$20K" period="Monthly" logo={microsoft}
          />
          <JobCard
            role="Product Designer" company="Behance"  bg="bg-[#211d24ff]"
            desc="The Sr Product designer will be responsible for creating production assets.."
            location="Andover, MA" type="Remote" salary="$25K" period="Monthly" logo={behance}
          />
          <JobCard 
            role="Marketing Officer" company="Mailchimp"  bg="bg-[#1d241dff]"
            desc="The Marketing will work as part of a global, cross functional team that creates"
            location="Weston, MA" type="Full-time" salary="$15K" period="Monthly" logo={mailchimp}
          />
        </div>
      </div>


      {/* --------------------------------------Job-Board------------------------------------------------ */}
      


    </div>
  )
}

export default LandingPage