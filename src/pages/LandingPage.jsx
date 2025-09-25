// import React from 'react'
import React from 'react';

// Cards
import JobCard from '../components/JobCard'

// Router
import { Link } from 'react-router';

// Company logo's
import Logo from '../components/Logo'
import microsoft from '../assets/microsoft.webp'
import behance from '../assets/behance.jpg'
import mailchimp from '../assets/mailchimp.png'
import facebook from '../assets/facebook.png'
import instagram from '../assets/instagram.png'
import linkedin from '../assets/linkedin.png'
import x from '../assets/x.png'
import youtube from '../assets/youtube.png'

// Buttons
import SolutionBtn from '../components/SolutionBtn'
import PrimaryBtn from '../components/PrimaryBtn'

// Lucide Icons
import { Megaphone, AppWindow, Brush, NotebookPen, Shield, BriefcaseBusiness, 
  Handshake, Landmark, Copyright } from 'lucide-react'

// const LandingPage = () => {
const LandingPage = () => {
  return (<>
    <div className='px-18'>
      {/* -------------------------------------Navigation-Bar----------------------------------------------------- */}
      <div className='flex justify-between items-center space-x-6 pt-9'>
        <Logo />
        <div className="flex items-center justify-center gap-x-14">
          <div>Home</div>
          <div>Find Jobs</div>
          <div>Job Alerts</div>
          <div>Find Candidates</div>
          <div>Career Advice</div>
        </div>
        <Link to="jobs"><PrimaryBtn text="Get Started" /></Link>
      </div>


      {/* -------------------------------------Hero-Section----------------------------------------------------- */}
      <div>
        <div className='text-center mt-30 text-8xl justify-center font-extrabold'><h1 className='mb-9'>Turning <span className='text-accent'>Potential</span></h1><h1>Into <span className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent'>Performance</span></h1></div>
        <div className='text-center mt-15 text-xl justify-center'><h1><span className='font-medium text-accent'>30,000+</span> companies rely on us! Your dream candidates are waiting</h1></div>
      </div>
      <hr className='h-[0.1rem] mx-40 mt-10 border-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'/>
    
      {/* --------------------------------------Job-Board------------------------------------------------ */}
      <div>
        <h1 className="text-4xl my-10 font-bold">Manage Hiring</h1>
        <div className='flex items-center justify-between'>
          <JobCard 
            role="Senior UI Designer" company="Microsoft" bg="bg-secondary"
            desc="Take advantage of a rare opportunity to start from the ground up and build.."
            location="Glendale, CA" type="Full-time" salary="$20K" period="Monthly" logo={microsoft}
          />
          <JobCard
            role="Product Designer" company="Behance"  bg="bg-blue"
            desc="The Sr Product designer will be responsible for creating production assets.."
            location="Andover, MA" type="Remote" salary="$25K" period="Monthly" logo={behance}
          />
          <JobCard 
            role="Marketing Officer" company="Mailchimp"  bg="bg-[#1d241dff]"
            desc="The Marketing will work as part of a global, cross functional team that creates"
            location="Weston, MA" type="Full-time" salary="$15K" period="Monthly" logo={mailchimp}
          />
        </div>
      </div>     
    </div>

    {/* --------------------------------------Solutions-Section------------------------------------------------ */}
    <div className='bg-blue px-18 pb-18'>
      <div><h1 className="text-5xl my-10 font-bold pt-20">One <span className='bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent'>Platform</span> Many Solutions</h1></div>
      <div className='grid grid-cols-4 gap-x-17 gap-y-8'>
        <SolutionBtn numCandidates="58" name="Marketing" ><Megaphone /></SolutionBtn>  
        <SolutionBtn numCandidates="48" name="Development"><AppWindow /></SolutionBtn>  
        <SolutionBtn numCandidates="78" name="UI/UX Design"><Brush /></SolutionBtn>  
        <SolutionBtn numCandidates="120" name="Human Research"><NotebookPen /></SolutionBtn>  
        <SolutionBtn numCandidates="90" name="Security"><Shield /></SolutionBtn>
        <SolutionBtn numCandidates="31" name="Business"><BriefcaseBusiness /></SolutionBtn>
        <SolutionBtn numCandidates="52" name="Management"><Handshake /></SolutionBtn>
        <SolutionBtn numCandidates="80" name="Finance"><Landmark /></SolutionBtn>  
      </div>
    </div>

    <div className='px-18'>
      {/* --------------------------------------Email-Subscription------------------------------------------------ */}
      <div className='flex flex-col items-center my-15 bg-[#d4cdd4ff] text-background rounded-4xl py-20 gap-10'>
        <div className='text-center'>
          <h1 className='text-6xl font-extrabold'>Never Want to Miss</h1>
          <h1 className='text-6xl font-extrabold'>Any Updates?</h1>
        </div>
        <div className='text-lg text-center'>
          <p>Subscribe to stay up-to-date on insights, events and new solutions.</p>
          <p>You can unsubscribe at any time.</p>
        </div>
        <div className="flex items-center w-[35rem] h-13 bg-text rounded-full overflow-hidden">
          <input
            type="text"
            placeholder="Enter your address"
            className="flex-1 px-5 py-2 focus:outline-none"
          />
          <button className="bg-secondary text-text font-bold text-xl px-7 py-4">
            Subscribe
          </button>
        </div>
      </div>

      
      {/* --------------------------------------Footer-Section------------------------------------------------ */}
      <div className='flex text-lg pb-15'>
        <div className='w-xl'><Logo /></div>
        <div className='grid grid-cols-4 gir gap-y-3 gap-x-22'>
          <p>About</p>
          <p>Press</p>
          <p>Partners Relations</p>
          <p>Blog</p>
          <p>Jobs</p>
          <p>Job Referrals</p>
          <p>Contact Us</p>
          <p>Help</p>
          <p>Careers</p>
          <p>Blog</p>
          <p>Help & Support</p>
          <p>Affiliate</p>
          <p>Terms</p>
          <p>Privacy Policy</p>
        </div>
      </div>
      <hr className='h-[0.1rem] border-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'/>

      <div className='text-[1.15rem] flex items-center justify-between py-5'>
        <div className='flex items-center justify-start gap-3'>
          <div className='p-2 rounded-full border-2 border-text h-10 w-10'><img src={facebook} alt="" /></div>
          <div className='p-2 rounded-full border-2 border-text h-10 w-10'><img src={instagram} alt="" /></div>
          <div className='p-2 rounded-full border-2 border-text h-10 w-10'><img src={x} alt="" /></div>
          <div className='p-2 rounded-full border-2 border-text h-10 w-10'><img src={linkedin} alt="" /></div>
          <div className='p-2 rounded-full border-2 border-text h-10 w-10'><img src={youtube} alt="" /></div>
        </div>
        <div className='flex items-center gap-7'>
          <p>Terms & Condition</p>
          <p>Privacy Policy</p>
          <p>Support</p>
        </div>
        <div className='flex items-center gap-1'><Copyright/><p>copyright Harsh. All Rights Reserved</p></div>
      </div>
    </div>
  </>)
}

export default LandingPage