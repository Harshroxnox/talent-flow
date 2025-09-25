import AssessmentCreation from "../pages/AssessmentCreation.jsx";
import CandidatesListing from "../pages/CandidatesListing.jsx";
import CandidateProfile from "../pages/CandidateProfile.jsx";
import CandidatesKanban from "../pages/CandidatesKanban.jsx";
import JobsListing from "../pages/JobsListing.jsx";
import LandingPage from "../pages/LandingPage.jsx";
import { Routes, Route } from "react-router";


function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="jobs" element={<JobsListing />} />
      <Route path="candidates" element={<CandidatesListing />} />
      <Route path="candidates/:id" element={<CandidateProfile />} />
      <Route path="jobs/:jobId/candidates" element={<CandidatesKanban />} />
      <Route path="assessments" element={<AssessmentCreation />} />
    </Routes>
  )
}

export default App
