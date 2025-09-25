import React from 'react';
import { Link } from 'react-router';
import { Mail, MapPin, Grip } from 'lucide-react';

const KanbanCard = ({ candidate, provided }) => {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className='bg-secondary p-3 rounded-lg mb-3 border border-border flex items-start gap-2'
    >
      {/* Drag Handle */}
      <div {...provided.dragHandleProps} className="cursor-grab py-1 text-grey hover:text-white">
        <Grip size={20} />
      </div>
      
      {/* Candidate Details */}
      <div>
        <Link to={`/candidates/${candidate.id}`} className="font-semibold hover:underline text-text">
          {candidate.name}
        </Link>
        <p className="text-sm text-grey flex items-center gap-2 mt-1">
          <Mail size={14} /> {candidate.email}
        </p>
        <p className="text-sm text-grey flex items-center gap-2 mt-1">
          <MapPin size={14} /> {candidate.city}, {candidate.country}
        </p>
      </div>
    </div>
  );
};

export default KanbanCard;