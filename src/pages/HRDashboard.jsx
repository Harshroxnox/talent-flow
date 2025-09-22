import Sidebar from '../components/Sidebar'

const HRDashboard = () => {
  return (
  <div className='flex h-screen text-[1.1rem]'>
    <Sidebar />
    <div className='flex-1'>Dashboard</div>
  </div>
  )
}

export default HRDashboard