import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useParams } from 'react-router';

import Sidebar from '../components/Sidebar';
import NoteInput from '../components/NoteInput';

import { fetchCandidate } from '../api/candidates';
import { fetchJobs } from '../api/jobs'; 
import { fetchNotes, createNote } from '../api/notes';

import { Mail, Phone, MapPin, Briefcase, Calendar, Send, Copy, DollarSign } from 'lucide-react';
import ProgressTimeline from '../components/ProgressTimeline';

import { useSidebarStore } from '../app/store/sidebarStore';

// Helper function to render text with styled @mentions
const renderNoteText = (text) => {
    return text.split(/(\s+)/).map((word, index) => {
      if (word.startsWith('@')) {
        return <strong key={index} className="text-accent">{word}</strong>;
      }
      return word;
    });
};


const CandidateProfile = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { isCollapsed } = useSidebarStore();

  const { data: candidate, isLoading: isLoadingCandidate } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => fetchCandidate(id),
  });

  // Fetch the specific job the candidate applied for
  const { data: job, isLoading: isLoadingJob } = useQuery({
    queryKey: ['job', candidate?.jobId],
    queryFn: () => fetchJobs({ id: candidate.jobId }),
    enabled: !!candidate?.jobId, 
    select: (data) => data.data[0], 
  });

  // Fetch notes for the candidate
  const { data: notes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ['notes', id],
    queryFn: () => fetchNotes(id),
  });

  // Mutation for creating a new note
  const { mutate: addNote, isLoading: isSavingNote } = useMutation({
    mutationFn: (text) => createNote({ candidateId: id, text }),
    onSuccess: () => {
        toast.success("Note added successfully!");
        queryClient.invalidateQueries({ queryKey: ['notes', id]});
    },
    onError: () => {
        toast.error("Failed to add note.");
    }
  });

  const handleCopy = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    toast.success("Copied to clipboard!");
  };


  if (isLoadingCandidate || isLoadingNotes || isLoadingJob || !candidate) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentHiringStatus = candidate.stage.charAt(0).toUpperCase() + candidate.stage.slice(1);

  return (
    <div className='flex h-screen text-[1.1rem]'>
      <Sidebar />
      <div className={`flex-1 px-15 overflow-y-auto pb-8 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-60'}`}>
        {/* --- Header Section --- */}
        <div className="my-8 p-6 bg-secondary rounded-xl border border-border">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className='text-3xl font-bold'>{candidate.name}</h1>
                    <div className="flex items-center gap-4 text-grey mt-2">
                        <span className="flex items-center gap-1">
                            <Briefcase size={16} /> {job?.title || 'No Job Assigned'}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin size={16} /> {candidate.city}, {candidate.country}
                        </span>
                    </div>
                </div>
                <button className="py-3 px-6 rounded-lg cursor-pointer bg-grey text-background font-semibold hover:bg-dark-grey flex items-center gap-2">
                    <Send size={18} />
                    Send Email
                </button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-grey mt-6">
                <div>
                    <p>Applied at</p>
                    <p className="font-semibold text-text mt-1">{new Date(candidate.appliedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div>
                    <p>Job Applied</p>
                    <p className="font-semibold text-text mt-1">{job?.title || 'N/A'}</p>
                </div>
                <div>
                    <p>Hiring Status</p>
                    <p className="font-semibold text-text mt-1">{currentHiringStatus}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
                {/* --- Job Applied Section --- */}
                <div className="p-6 bg-blue rounded-xl border border-border">
                    <h2 className='text-xl font-bold mb-4'>Job Applied</h2>
                    <h3 className="text-3xl font-semibold text-accent">{job.title}</h3>
                    <div className="flex items-center gap-4 text-grey mt-2">
                        <span><Briefcase size={16} className="inline mr-2"/>{job.type}</span>
                        <span><MapPin size={16} className="inline mr-2"/>{job.location}</span>
                        <span><Calendar size={16} className="inline mr-2"/> Applied on {new Date(candidate.appliedDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-grey mt-4">{job?.desc || 'No description available.'}</p>
                    <p className="text-accent text-2xl font-semibold mt-2 flex items-center gap-2"> ${job.amount}K Monthly</p>
                </div>

                {/* --- Progress Timeline Section --- */}
                <div className="p-6 bg-secondary rounded-xl border border-border">
                    <h2 className='text-2xl font-bold mb-4'>Progress Timeline</h2>
                    <ProgressTimeline currentStage={candidate.stage} appliedDate={candidate.appliedDate} />
                </div>

                {/* Notes Section */}
                <div className="p-6 bg-blue rounded-xl border border-border">
                     <h2 className='text-2xl font-bold mb-4'>Notes</h2>
                     <NoteInput onSubmit={addNote} isSaving={isSavingNote} />
                     <div className="mt-6 space-y-4">
                        {notes?.map(note => (
                            <div key={note.id} className="bg-secondary p-4 rounded-lg border border-border">
                                <p className="text-text whitespace-pre-wrap">{renderNoteText(note.text)}</p>
                                <p className="text-xs text-grey text-right mt-2">
                                    {new Date(note.createdAt).toLocaleString()}
                                </p>
                            </div>
                        ))}
                     </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-8">
                {/* Profile Details Section */}
                <div className="p-6 bg-secondary rounded-xl border border-border">
                  
                    <h2 className='text-2xl font-bold pb-5'>Profile Details</h2>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                                <Phone size={22} className="text-grey mt-1"/>
                                <div>
                                    <p className="text-[1rem] text-grey">Phone number</p>
                                    <p>{candidate.phone}</p>
                                </div>
                            </div>
                            <button onClick={() => handleCopy(candidate.phone)} className="p-1 text-grey hover:text-white">
                                <Copy size={20} />
                            </button>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                                <Mail size={22} className="text-grey mt-1"/>
                                <div>
                                    <p className="text-[1rem] text-grey">Email Address</p>
                                    <p>{candidate.email}</p>
                                </div>
                            </div>
                            <button onClick={() => handleCopy(candidate.email)} className="p-1 text-grey hover:text-white">
                                <Copy size={20} />
                            </button>
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                                <MapPin size={22} className="text-grey mt-1"/>
                                <div>
                                    <p className="text-[1rem] text-grey">Location</p>
                                    <p>{candidate.city}, {candidate.country}</p>
                                </div>
                            </div>
                        </div>
                         <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                                <Briefcase size={22} className="text-grey mt-1"/>
                                <div>
                                    <p className="text-[1rem] text-grey">Experience</p>
                                    <p>{candidate.experience} years</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skills Section */}
                <div className="p-6 bg-blue rounded-xl border border-border">
                    <h2 className='text-2xl font-bold mb-4'>Professional Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {(candidate.skills || []).map((skill, index) => (
                            <span key={index} className="bg-dark-grey text-background font-medium text-sm px-3 py-1 rounded-md">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;