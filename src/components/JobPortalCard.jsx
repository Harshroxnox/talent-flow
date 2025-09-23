import React from 'react'
import { MapPin, Briefcase, EllipsisVertical, LayoutGrid } from 'lucide-react'

const JobPortalCard = ({ title, status, desc, location, type, amount }) => {
  return (
    <div className="flex flex-col gap-3 text-sm p-6 bg-blue rounded-2xl border-[0.01rem] border-[#343434ff]">
      <div className='flex items-center justify-between'>
        <div>
          <div>
            <div className='text-lg font-normal text-teal-50'>{title}</div>
            <div className='font-normal'>{status==='active'? "Active": "Archived"}</div>
          </div>
        </div>
        <div className='flex gap-2'>
          <div className='p-1 cursor-pointer hover:bg-[#1c1c1C] rounded-sm'><LayoutGrid /></div>
          <div className='p-1 cursor-pointer hover:bg-[#1c1c1C] rounded-sm'><EllipsisVertical /></div>
        </div>
      </div >
      <div>{desc}</div>
      <div className='flex items-center justify-start gap-3'>
        <div className='flex gap-1'> <MapPin /> <p>{location}</p></div>
        <div className='flex gap-2'> <Briefcase /> <p>{type}</p></div>
      </div>
      <div className='flex items-center justify-between'>
        <div>
          <div className='text-lg font-normal'>{`$${amount}K`}</div>
          <div>Monthly</div>
        </div>
        <div className='px-16 py-3 border-1 font-bold rounded-full cursor-pointer hover:bg-background'>Candidates</div>
      </div>
    </div>
  )
}

export default JobPortalCard