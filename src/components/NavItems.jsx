import React from 'react'

const NavItems = ({ Icon, label }) => {
  return (
    <div className='flex items-center gap-2 cursor-pointer rounded-lg p-1 hover:bg-dark-grey'><Icon strokeWidth={1.6} color="#363636" /><p>{label}</p></div>
  )
}

export default NavItems