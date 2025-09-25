import { Monitor, Briefcase, Users, FilePen, Settings, ChevronLeft } from 'lucide-react'
import NavItems from '../components/NavItems'
import { useSidebarStore } from '../app/store/sidebarStore';

const Sidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebarStore();

  return (
    <div className={`fixed h-[99vh] flex flex-col justify-between bg-grey text-background m-1 p-5 rounded-xl transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-60'}`}>
      <div>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="font-bold text-2xl">TalentFlow</div>
          )}
          <button onClick={toggleSidebar} className="p-1 rounded-full hover:bg-dark-grey">
            <ChevronLeft size={24} strokeWidth={1.6} color="#363636" className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <hr className='h-[0.1rem] mt-2 border-0 bg-[#c0b3c0ff]'/>
        
        <div className='flex flex-col mt-6'>
          <NavItems Icon={Monitor} label="Dashboard" to="/dashboard" isCollapsed={isCollapsed} />
          <NavItems Icon={Briefcase} label="Jobs" to="/jobs" isCollapsed={isCollapsed} />
          <NavItems Icon={Users} label="Candidates" to="/candidates" isCollapsed={isCollapsed} />
          <NavItems Icon={FilePen} label="Assessments" to="/assessments" isCollapsed={isCollapsed} />
        </div>
      </div>

      <div>
        <hr className='h-[0.1rem] mt-2 border-0 bg-[#c0b3c0ff]'/>
        <div className={`flex items-center pt-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`leading-4.5 ${isCollapsed ? 'hidden' : 'block'}`}>
            <p className='text-[1rem] font-[400]'>Sandra Marx</p>
            <p className='text-[0.8rem]'>sandra@gmail.com</p>
          </div>
          <div className='p-2 rounded-xl hover:bg-dark-grey cursor-pointer'><Settings strokeWidth={1.6} color="#363636" /></div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar