import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import Sidebar from '../components/Sidebar';
import { fetchCandidate, fetchCandidateTimeline } from '../api/candidates';
import NoteInput from '../components/NoteInput';

const CandidateProfile = () => {
  const { id } = useParams();

  const { data: candidate, isLoading: isLoadingCandidate } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => fetchCandidate(id),
  });

  const { data: timeline, isLoading: isLoadingTimeline } = useQuery({
    queryKey: ['candidateTimeline', id],
    queryFn: () => fetchCandidateTimeline(id),
  });

  if (isLoadingCandidate || isLoadingTimeline) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex h-screen text-[1.1rem]'>
      <Sidebar />
      <div className='ml-61 flex-1 px-15'>
        <h1 className='text-3xl font-bold my-4'>{candidate.name}</h1>
        <p className='text-lg'>{candidate.email}</p>
        <p className='text-lg'>Current Stage: {candidate.stage}</p>

        <div className='my-8'>
          <h2 className='text-2xl font-bold mb-4'>Application Timeline</h2>
          {timeline.map((item, index) => (
            <div key={index} className='mb-4'>
              <p className='font-bold'>{new Date(item.submittedAt).toLocaleDateString()}</p>
              <p>Applied for Job ID: {item.jobId}</p>
            </div>
          ))}
        </div>
        <NoteInput />
      </div>
    </div>
  );
};

export default CandidateProfile;