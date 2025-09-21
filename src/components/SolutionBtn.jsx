import React from 'react'
import { ChevronRight } from 'lucide-react'

const SolutionBtn = ({ name, numCandidates, children }) => {
  return (
    <div className='flex justify-between items-center py-2 px-5 rounded-full bg-background'>
      <div className='p-3 rounded-full bg-blue'>
        {children}
      </div>
      <div className='flex flex-col gap-1 pr-4'>
        <div className='font-bold'>{name}</div>
        <div>{numCandidates} Candidates Applied</div>
      </div>
      <div>
        <ChevronRight />
      </div>
    </div>
  )
}

export default SolutionBtn