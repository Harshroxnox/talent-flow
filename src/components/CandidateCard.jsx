import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Mail, Briefcase, EllipsisVertical, Edit, MapPin } from 'lucide-react';

const CandidateCard = ({ candidate, onEdit }) => {
  const { id, name, email, stage, city, country, experience } = candidate;
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
    onEdit(candidate);
    setIsMenuOpen(false);
  };

  return (
    <div className="flex flex-col gap-3 text-[1rem] p-6 bg-blue rounded-2xl border-[0.01rem] border-[#343434ff] h-full">
      <div className='flex items-start justify-between'>
        <div>
          <Link to={`/candidates/${id}`} className="text-lg font-[500] hover:underline">
            {name}
          </Link>
          <div className='flex items-center gap-2 mt-1 ml-1 text-grey'>
            <Mail size={18} />
            <p>{email}</p>
          </div>
           <div className='flex items-center gap-2 mt-1 ml-1 text-grey'>
            <MapPin size={18} />
            <p>{city}, {country}</p>
          </div>
        </div>
        <div className='relative' ref={menuRef}>
          <div onClick={() => setIsMenuOpen(!isMenuOpen)} className='p-1 cursor-pointer hover:bg-[#1c1c1C] rounded-sm'>
            <EllipsisVertical />
          </div>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-secondary border border-border rounded-lg shadow-xl z-10">
              <ul className="py-1">
                <li>
                  <button onClick={handleEdit} className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-text hover:bg-blue">
                    <Edit size={16} /> Edit
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Briefcase size={24} />
           <p className='capitalize bg-grey text-background ml-1 px-3 py-1 rounded-full'>{experience} Yrs</p>
          <p className="capitalize px-3 py-1 rounded-full">{stage}</p>
        </div>
        <Link to={`/candidates/${id}`} className='px-6 py-2 border-1 font-bold rounded-full cursor-pointer hover:bg-background '>
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default CandidateCard;