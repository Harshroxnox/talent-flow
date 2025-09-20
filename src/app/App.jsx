import AssessmentCreation from "../pages/AssessmentCreation.jsx";
import CandidatesKanban from "../pages/CandidatesKanban.jsx";
import HRDashboard from "../pages/HRDashboard.jsx";
import JobsListing from "../pages/JobsListing.jsx";
import LandingPage from "../pages/LandingPage.jsx";
import { Routes, Route } from "react-router";


function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="jobs" element={<JobsListing />} />
      <Route path="dashboard" element={<HRDashboard />} />
      <Route path="candidates" element={<CandidatesKanban />} />
      <Route path="assessment" element={<AssessmentCreation />} />
    </Routes>
  )
}

export default App
