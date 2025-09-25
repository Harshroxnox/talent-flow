import { CheckCircle, Clock, Circle, XCircle } from 'lucide-react';

// The defined order of stages in the hiring pipeline
const stages = ['applied', 'screen', 'tech', 'offer', 'hired'];

const ProgressTimeline = ({ currentStage, appliedDate }) => {
  const currentStageIndex = stages.indexOf(currentStage);

  // Create mock dates for the timeline progression
  const stageDates = stages.reduce((dates, stage, index) => {
    if (index === 0) {
      dates[stage] = new Date(appliedDate);
    } else {
      // Add a random number of days (2-7) to the previous stage's date
      const prevDate = dates[stages[index - 1]];
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + Math.floor(Math.random() * 6) + 2);
      dates[stage] = newDate;
    }
    return dates;
  }, {});


  // If the candidate is rejected, we show a specific status message.
  if (currentStage === 'rejected') {
    return (
        <div className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <XCircle size={22} className="text-red-400 flex-shrink-0" />
            <div>
                <p className="font-semibold text-red-400">Rejected</p>
                <p className="text-xs text-grey">This candidate has been rejected.</p>
            </div>
        </div>
    );
  }
  
  // If the stage is not in our main pipeline, render a simple status
  if (currentStageIndex === -1) {
    return <p className="text-grey">The candidate is in the '{currentStage}' stage.</p>;
  }


  return (
    <div className="flex w-full">
      {stages.map((stage, index) => {
        const isCompleted = index < currentStageIndex;
        const isCurrent = index === currentStageIndex;
        const isFuture = index > currentStageIndex;

        let bgColor;
        if (isCurrent) {
            bgColor = 'bg-[#C4BDC4] text-background'; 
        } else if (isCompleted) {
            bgColor = 'bg-[#37303c]'; 
        } else {
            bgColor = 'bg-[#1e1921]'; 
        }
        
        const subtext = (isCompleted || isCurrent) ? (
            <p className={`text-sm font-[400] mt-1 ${isCurrent? "text-background":""}`}>{stageDates[stage].toLocaleDateString()}</p>
        ) : null;

        return (
          <div
            key={stage}
            className={`flex-1 text-center p-3 font-semibold capitalize transition-colors ${bgColor}`}
            style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%, 20px 50%)' }}
          >
            <div>{stage === 'tech' ? 'Technical' : stage}</div>
            {subtext}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressTimeline;