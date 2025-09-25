import { useParams, useLocation } from 'react-router';
import AssessmentBuilder from '../components/AssessmentBuilder';
import Sidebar from '../components/Sidebar';
import { useSidebarStore } from '../app/store/sidebarStore';

const AssessmentCreation = () => {
  const { jobId } = useParams();
  const { isCollapsed } = useSidebarStore(); 
  const location = useLocation();
  const jobPrefill = location?.state?.jobPrefill;
  const effectiveJobId = jobId || jobPrefill || null;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-60'}`}>
        <AssessmentBuilder jobId={effectiveJobId} />
      </div>
    </div>
  );
};

export default AssessmentCreation;