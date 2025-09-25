import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Mail, Briefcase, EllipsisVertical, Edit, MapPin, Star } from 'lucide-react';

const CandidateCard = ({ candidate, onEdit }) => {
  const { id, name, email, stage, city, country, experience, skills } = candidate;
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

  const displayedSkills = skills.slice(0, 4);

  return (
    <div className="flex flex-col gap-3 text-sm p-6 bg-blue rounded-2xl border border-border h-full
                    transition-transform duration-300 hover:scale-105">
      <div className='flex items-start justify-between z-10'>
        <div>
          <Link to={`/candidates/${id}`} className="text-[1.25rem] font-normal text-teal-50 hover:underline">
            {name}
          </Link>
          <div className='flex items-center text-[0.95rem] gap-2 mt-1 text-grey'>
            <Mail size={20} />
            <p>{email}</p>
          </div>
           <div className='flex items-center text-[0.95rem] gap-2 mt-1 text-grey'>
            <MapPin size={20} />
            <p>{city}, {country}</p>
          </div>
          {/* --- Skills Section --- */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Star size={20} className="text-grey"/>
              {displayedSkills.map(skill => (
                  <span key={skill} className="bg-dark-grey text-background font-medium text-sm px-3 py-1 rounded-md">{skill}</span>
              ))}
          </div>
        </div>
        <div className='relative z-10' ref={menuRef}>
          <div onClick={() => setIsMenuOpen(!isMenuOpen)} className='p-1 cursor-pointer hover:bg-[#1c1c1C] rounded-sm'>
            <EllipsisVertical />
          </div>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-secondary border border-border rounded-lg shadow-xl z-20">
              <ul className="py-1">
                <li>
                  <button onClick={handleEdit} className="flex items-center gap-3 w-full text-left px-4 py-2 text-md text-text hover:bg-blue">
                    <Edit size={18} /> Edit
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className='flex items-center justify-between mt-auto pt-4 z-10'>
        <div className='flex items-center gap-2'>
          <Briefcase size={20} />
           <p className='capitalize bg-border px-3 py-1 rounded-full text-[1rem]'>{experience} Yrs</p>
          <p className='capitalize bg-border px-3 py-1 rounded-full text-[1rem]'>{stage}</p>
        </div>
        <Link to={`/candidates/${id}`} className='px-6 py-2 border-1 font-bold rounded-full cursor-pointer hover:bg-background text-[1rem]'>
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default CandidateCard;