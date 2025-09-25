import { useParams, useLocation } from 'react-router';
import AssessmentBuilder from '../components/AssessmentBuilder';
import Sidebar from '../components/Sidebar';

const AssessmentCreation = () => {
  const { jobId } = useParams();
  const location = useLocation();
  const jobPrefill = location?.state?.jobPrefill;
  const effectiveJobId = jobId || jobPrefill || null;

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 ml-61">
        <AssessmentBuilder jobId={effectiveJobId} />
      </div>
    </div>
  );
};

export default AssessmentCreation;