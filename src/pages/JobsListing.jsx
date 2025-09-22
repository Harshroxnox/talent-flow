import React from 'react'
import { Monitor, Briefcase, Users, Moon, FilePen, Settings } from 'lucide-react'
import NavItems from '../components/NavItems'

const JobsListing = () => {
  return (<div className='flex h-screen text-[1.1rem]'>
    <div className='flex flex-col justify-between w-60 bg-grey text-background m-1 p-5 rounded-xl'>
      <div className='flex flex-col gap-6'>
        <div className="font-bold text-2xl">
          <span className='text-accent'>T</span>alent<span className='text-accent'>F</span>low
          <hr className='h-[0.1rem] mt-2 border-0 bg-[#c0b3c0ff]'/>
        </div>
        
        <div className='flex flex-col'>
          <NavItems Icon={Monitor} label="Dashboard" />
          <NavItems Icon={Briefcase} label="Jobs" />
          <NavItems Icon={Users} label="Candidates" />
          <NavItems Icon={FilePen} label="Assessments" />
        </div>
      </div>

      <div>
        <hr className='h-[0.1rem] mt-2 border-0 bg-[#c0b3c0ff]'/>
        <div className='flex items-center justify-between pt-4'>
          <div className='leading-4.5'>
            <p className='text-[1rem] font-[400]'>Sandra Marx</p>
            <p className='text-[0.8rem]'>sandra@gmail.com</p>
          </div>
          <div className='p-2 rounded-xl hover:bg-dark-grey cursor-pointer'><Settings strokeWidth={1.6} color="#363636" /></div>
        </div>
      </div>

      
    </div>
    <div className='flex-1'>Main</div>
  </div>)
}

export default JobsListing