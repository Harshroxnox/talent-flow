import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { MapPin, Briefcase, EllipsisVertical, LayoutGrid, Edit, Archive, ArchiveRestore } from 'lucide-react'

const JobPortalCard = ({ job, onEdit, onToggleArchive, provided }) => {
  const { id, title, status, desc, location, type, amount } = job
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = () => {
    onEdit(job);
    setIsMenuOpen(false);
  }

  const handleToggleArchive = () => {
    onToggleArchive(job);
    setIsMenuOpen(false);
  }

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className="flex flex-col gap-3 text-sm p-6 bg-blue rounded-2xl border-[0.01rem] border-[#343434ff]"
    >
      <div className='flex items-center justify-between'>
        <div>
          <div>
            <div className='text-lg font-normal text-teal-50'>{title}</div>
            <div className='font-normal'>{status==='active'? "Active": "Archived"}</div>
          </div>
        </div>
        <div className='flex gap-2'>
          <div {...provided.dragHandleProps} className='p-1 cursor-grab hover:bg-[#1c1c1C] rounded-sm'><LayoutGrid /></div>

          <div className='relative' ref={menuRef}>
            <div onClick={() => setIsMenuOpen(!isMenuOpen)} className='p-1 cursor-pointer hover:bg-[#1c1c1C] rounded-sm'><EllipsisVertical /></div>
            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-secondary border border-border rounded-lg shadow-xl z-10">
                <ul className="py-1">
                  <li>
                    <button onClick={handleEdit} className="flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-blue">
                      <Edit size={16} /> Edit
                    </button>
                  </li>
                  <li>
                    <button onClick={handleToggleArchive} className={`flex items-center gap-3 px-4 py-2 text-sm hover:bg-blue ${status === 'active' ? 'text-text' : 'text-green-400'}`}>
                      {status === 'active' ? <><Archive size={16} /> Archive</> : <><ArchiveRestore size={16} /> Unarchive</>}
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
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
        <Link to={`/jobs/${id}/candidates`} className='px-16 py-3 border-1 font-bold rounded-full cursor-pointer hover:bg-background'>
          Candidates
        </Link>
      </div>
    </div>
  )
}

export default JobPortalCard