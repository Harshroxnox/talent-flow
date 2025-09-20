import React from 'react'
import logo from '../assets/microsoft.webp'
import { MapPin, Briefcase  } from 'lucide-react'

const JobCard = (props) => {
  return (
    <div className='flex flex-col gap-3 w-[28vw] p-8 bg-secondary rounded-2xl'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='text-lg font-normal text-teal-50'>Senior UI Designer</div>
          <div className='font-normal'>Microsoft</div>
        </div>
        <div className='h-12 w-12'>
          <img src={logo} alt="" />
        </div>
      </div >
      <div>Take advantage of a rare opportunity to start from the ground up and build..</div>
      <div className='flex items-center justify-start gap-3'>
        <div className='flex gap-1'> <MapPin /> <p>Glendale, CA</p></div>
        <div className='flex gap-2'> <Briefcase /> <p>Full-time</p></div>
      </div>
      <div className='flex items-center justify-between'>
        <div>
          <div className='text-lg font-normal'>20K</div>
          <div>Monthly</div>
        </div>
        <div className='px-16 py-3 border-1 font-bold rounded-full'>Candidates</div>
      </div>
    </div>
  )
}

export default JobCard