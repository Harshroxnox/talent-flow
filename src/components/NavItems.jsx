import React from 'react'
import { NavLink } from 'react-router'

const NavItems = ({ Icon, label, to }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => (
        `flex items-center gap-2 cursor-pointer rounded-lg p-1 hover:bg-dark-grey ${isActive? "bg-dark-grey": ""}`
      )
    }>
      <Icon strokeWidth={1.6} color="#363636" /><p>{label}</p>
    </NavLink>
  )
}

export default NavItems