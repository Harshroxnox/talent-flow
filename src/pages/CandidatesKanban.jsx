import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router';
import Sidebar from '../components/Sidebar';
import { fetchCandidates, updateCandidate } from '../api/candidates';
import { queryClient } from '../app/queryClient';
import toast from 'react-hot-toast';

const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

const CandidatesKanban = () => {
  const { jobId } = useParams();

  const { data, isFetching } = useQuery({
    queryKey: ['candidates', { jobId }],
    queryFn: () => fetchCandidates({ jobId }),
  });

  const { mutate: moveCandidate } = useMutation({
    mutationFn: updateCandidate,
    onSuccess: () => {
      toast.success('Candidate stage updated!');
      queryClient.invalidateQueries({ queryKey: ['candidates', { jobId }] });
    },
    onError: () => {
      toast.error('Failed to update candidate stage.');
    },
  });

  const handleDrop = (e, stage) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('candidateId');
    moveCandidate({ id: candidateId, stage });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragStart = (e, candidateId) => {
    e.dataTransfer.setData('candidateId', candidateId);
  };

  return (
    <div className='flex h-screen text-[1.1rem]'>
      <Sidebar />
      <div className='ml-61 flex-1 px-15'>
        <h1 className='text-3xl font-bold my-4'>Candidates for Job {jobId}</h1>
        {isFetching ? (
          <div>Loading...</div>
        ) : (
          <div className='grid grid-cols-6 gap-4'>
            {stages.map((stage) => (
              <div
                key={stage}
                className='bg-blue p-4 rounded'
                onDrop={(e) => handleDrop(e, stage)}
                onDragOver={handleDragOver}
              >
                <h2 className='font-bold mb-4 capitalize'>{stage}</h2>
                {data.data
                  .filter((c) => c.stage === stage)
                  .map((candidate) => (
                    <div
                      key={candidate.id}
                      className='bg-secondary p-2 rounded mb-2 cursor-move'
                      draggable
                      onDragStart={(e) => handleDragStart(e, candidate.id)}
                    >
                      <p>{candidate.name}</p>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidatesKanban;