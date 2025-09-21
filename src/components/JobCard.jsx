import React from 'react'
import { MapPin, Briefcase  } from 'lucide-react'

const JobCard = (data) => {
  return (
    <div className={`flex flex-col gap-3 w-[28vw] p-8 ${data.bg} rounded-2xl`}>
      <div className='flex items-center justify-between'>
        <div>
          <div className='text-lg font-normal text-teal-50'>{data.role}</div>
          <div className='font-normal'>{data.company}</div>
        </div>
        <div className='h-12 w-12'>
          <img src={data.logo} alt="" />
        </div>
      </div >
      <div>{data.desc}</div>
      <div className='flex items-center justify-start gap-3'>
        <div className='flex gap-1'> <MapPin /> <p>{data.location}</p></div>
        <div className='flex gap-2'> <Briefcase /> <p>{data.type}</p></div>
      </div>
      <div className='flex items-center justify-between'>
        <div>
          <div className='text-lg font-normal'>{data.salary}</div>
          <div>{data.period}</div>
        </div>
        <div className='px-16 py-3 border-1 font-bold rounded-full'>Candidates</div>
      </div>
    </div>
  )
}

export default JobCard