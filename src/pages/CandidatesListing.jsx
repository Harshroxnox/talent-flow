import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../components/Sidebar';
import { fetchCandidates } from '../api/candidates';
import Pagination from '../components/Pagination';
import CandidateCard from '../components/CandidateCard';
import CandidateFormModal from '../components/CandidateFormModal';
import { Plus } from 'lucide-react';
import { useSidebarStore } from '../app/store/sidebarStore'; // Import the sidebar store

const CandidatesListing = () => {
  const { isCollapsed } = useSidebarStore(); // Get the sidebar state
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9); // Grid of 3x3

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);

  const { data, isFetching } = useQuery({
    queryKey: ['candidates', { search, stage, page, pageSize }],
    queryFn: () => fetchCandidates({ search, stage, page, pageSize }),
    keepPreviousData: true,
  });

  // Modal handlers
  const handleOpenCreateModal = () => {
    setEditingCandidate(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (candidate) => {
    setEditingCandidate(candidate);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className='flex h-screen text-[1.1rem]'>
        <Sidebar />
        {/* Adjust the left margin based on the sidebar's state */}
        <div className={`flex-1 px-15 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-60'}`}>
          <div className='flex justify-between items-center'>
            <h1 className='text-3xl font-bold my-4'>Candidates</h1>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 py-2 px-4 rounded-lg bg-grey text-background font-semibold hover:bg-dark-grey"
            >
              <Plus size={20} /> Create Candidate
            </button>
          </div>
          <div className='flex justify-between mb-4'>
            <input
              type='text'
              placeholder='Search by name or email...'
              className='w-1/3 p-2 border rounded bg-background'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className='p-2 border rounded bg-background'
              value={stage}
              onChange={(e) => setStage(e.target.value)}
            >
              <option value=''>All Stages</option>
              <option value='applied'>Applied</option>
              <option value='screen'>Screen</option>
              <option value='tech'>Tech</option>
              <option value='offer'>Offer</option>
              <option value='hired'>Hired</option>
              <option value='rejected'>Rejected</option>
            </select>
          </div>
          {isFetching ? (
            <div className='flex justify-center items-center flex-1'>
              <div className='w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
            </div>
          ) : (
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {data?.data?.map(candidate => (
                  <CandidateCard key={candidate.id} candidate={candidate} onEdit={handleOpenEditModal} />
                ))}
              </div>
            </div>
          )}
          {!isFetching && data && (
            <div className='flex items-center justify-center py-4'>
                <Pagination
                    page={page}
                    setPage={setPage}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    totalItems={data.total}
                />
            </div>
          )}
        </div>
      </div>
      <CandidateFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        candidateToEdit={editingCandidate}
      />
    </>
  );
};

export default CandidatesListing;