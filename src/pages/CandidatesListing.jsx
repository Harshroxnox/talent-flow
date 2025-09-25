import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../components/Sidebar';
import { fetchCandidates } from '../api/candidates';
import Pagination from '../components/Pagination';
import CandidateCard from '../components/CandidateCard';
import CandidateFormModal from '../components/CandidateFormModal';
import { Plus, ChevronDown } from 'lucide-react';
import { useSidebarStore } from '../app/store/sidebarStore';
import SearchBar from '../components/SearchBar'; 

const CandidatesListing = () => {
  const { isCollapsed } = useSidebarStore();
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

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
        <div className={`flex-1 px-15 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-60'}`}>
        <h1 className="w-fit text-5xl font-bold my-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Candidates
        </h1>
          <div className='flex justify-between items-center mb-4 gap-4'>
            <div className="flex items-center gap-4 w-2/3">
                <SearchBar
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                />
                {/* --- Updated Dropdown --- */}
                <div className="relative w-[200px]">
                    <select
                    className='appearance-none w-full text-center p-3 border border-border rounded-md bg-blue focus:outline-none focus:ring-2 focus:ring-accent pr-10'
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
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                        <ChevronDown size={20} className="text-grey" />
                    </div>
                </div>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 py-3 px-6 rounded-lg bg-primary text-background font-semibold hover:bg-primary/90"
            >
              <Plus size={20} /> Create Candidate
            </button>
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