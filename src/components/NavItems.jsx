import React from 'react'
import { NavLink } from 'react-router'

const NavItems = ({ Icon, label, to, isCollapsed }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => (
        `flex items-center gap-2 cursor-pointer rounded-lg p-2 my-1 hover:bg-dark-grey ${isActive ? "bg-dark-grey" : ""} ${isCollapsed ? 'justify-center' : ''}`
      )
    }>
      <Icon strokeWidth={1.6} color="#363636" />
      {!isCollapsed && <p>{label}</p>}
    </NavLink>
  )
}

export default NavItems