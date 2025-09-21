import React from 'react'

const PrimaryBtn = (data) => {
  return (
    <div className="px-7 py-4 font-medium text-[1.1rem] bg-accent text-slate-950 rounded-full">{data.text}</div>
  )
}

export default PrimaryBtn