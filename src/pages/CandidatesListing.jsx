import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import Sidebar from '../components/Sidebar';
import { fetchCandidates } from '../api/candidates';
import Pagination from '../components/Pagination';

const CandidatesListing = () => {
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isFetching } = useQuery({
    queryKey: ['candidates', { search, stage, page, pageSize }],
    queryFn: () => fetchCandidates({ search, stage, page, pageSize }),
    keepPreviousData: true,
  });

  return (
    <div className='flex h-screen text-[1.1rem]'>
      <Sidebar />
      <div className='ml-61 flex-1 px-15'>
        <h1 className='text-3xl font-bold my-4'>Candidates</h1>
        <div className='flex justify-between mb-4'>
          <input
            type='text'
            placeholder='Search by name or email...'
            className='w-1/3 p-2 border rounded'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className='p-2 border rounded'
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
          <div className='flex justify-center items-center h-64'>
            <div className='w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
          </div>
        ) : (
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr>
                <th className='py-2 px-4 border-b'>Name</th>
                <th className='py-2 px-4 border-b'>Email</th>
                <th className='py-2 px-4 border-b'>Stage</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((candidate) => (
                <tr key={candidate.id} className='hover:bg-blue'>
                  <td className='py-2 px-4 border-b'>
                    <Link to={`/candidates/${candidate.id}`} className="text-primary hover:underline">
                      {candidate.name}
                    </Link>
                  </td>
                  <td className='py-2 px-4 border-b'>{candidate.email}</td>
                  <td className='py-2 px-4 border-b'>{candidate.stage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isFetching && (
          <Pagination
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalItems={data.total}
          />
        )}
      </div>
    </div>
  );
};

export default CandidatesListing;