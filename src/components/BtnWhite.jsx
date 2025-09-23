import React from 'react'

const BtnWhite = ({ label }) => {
  return (
    <button className='self-start rounded-md text-[1rem] cursor-pointer hover:bg-dark-grey bg-grey text-background font-[400] py-[0.4rem] px-3'>{label}</button>
  )
}

export default BtnWhite