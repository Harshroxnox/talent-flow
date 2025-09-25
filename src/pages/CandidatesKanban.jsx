import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router';
import Sidebar from '../components/Sidebar';
import { fetchCandidates, updateCandidate } from '../api/candidates';
import toast from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import KanbanCard from '../components/KanbanCard'; 
import { useSidebarStore } from '../app/store/sidebarStore'; // Import the sidebar store

const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

const CandidatesKanban = () => {
  const { jobId } = useParams();
  const queryClient = useQueryClient();
  const { isCollapsed } = useSidebarStore(); // Get the sidebar state

  const { data, isFetching } = useQuery({
    queryKey: ['candidates', { jobId }],
    queryFn: () => fetchCandidates({ jobId, pageSize: 1000 }), // Fetch all for Kanban
  });

  const { mutate: moveCandidate } = useMutation({
    mutationFn: updateCandidate,
    onMutate: async ({ id, stage }) => {
      await queryClient.cancelQueries(['candidates', { jobId }]);
      const previousCandidates = queryClient.getQueryData(['candidates', { jobId }]);
      queryClient.setQueryData(['candidates', { jobId }], (oldData) => {
        const optimisticData = oldData.data.map(c => c.id === Number(id) ? { ...c, stage } : c);
        return { ...oldData, data: optimisticData };
      });
      return { previousCandidates };
    },
    onSuccess: () => {
      toast.success('Candidate stage updated!');
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(['candidates', { jobId }], context.previousCandidates);
      toast.error('Failed to update candidate stage.');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['candidates', { jobId }]);
    },
  });

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { destination, draggableId } = result;
    moveCandidate({ id: draggableId, stage: destination.droppableId });
  };

  return (
    <div className='flex h-screen text-[1.1rem] overflow-x-auto'>
      <Sidebar />
      {/* Adjust the left margin based on the sidebar's state */}
      <div className={`flex-1 px-15 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-60'}`}>
        <h1 className='text-3xl font-bold my-4 flex-shrink-0'>Candidates for Job {jobId}</h1>
        {isFetching ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto pb-4">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className='flex gap-5'>
                {stages.map((stage) => (
                  <Droppable key={stage} droppableId={stage}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`w-80 flex-shrink-0 bg-blue p-4 rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-secondary' : ''}`}
                      >
                        <h2 className='font-bold mb-4 capitalize'>{stage} ({data?.data?.filter(c => c.stage === stage).length || 0})</h2>
                        <div className="min-h-[200px]">
                          {data?.data
                            ?.filter((c) => c.stage === stage)
                            .map((candidate, index) => (
                              <Draggable
                                key={candidate.id}
                                draggableId={candidate.id.toString()}
                                index={index}
                              >
                                {(provided) => (
                                  <KanbanCard candidate={candidate} provided={provided} />
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidatesKanban;