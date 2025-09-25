# TalentFlow - A Mini Hiring Platform

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

TalentFlow is a modern, all-in-one hiring platform designed to streamline the recruitment process. It provides HR professionals with the tools to manage job openings, track candidates, and create custom skill assessments.

## Features

-   **Job Management**: Create, view, and manage job listings with ease.
-   **Candidate Tracking**: A Kanban board to visualize and manage the candidate pipeline for each job.
-   **Candidate Profiles**: View detailed profiles for each candidate.
-   **Dynamic Assessment Builder**: Construct custom assessments with various question types (multiple choice, text, file upload), conditional logic, and validation rules.
-   **HR Dashboard**: A central hub providing an overview of hiring activities.
-   **Mock API Integration**: Utilizes Mock Service Worker (`msw`) to simulate a backend, allowing for a full-fledged frontend experience without a live server.
-   **Client-Side State Management**: Uses `zustand` for global state and `@tanstack/react-query` for server state management and caching.
-   **Local Persistence**: Leverages `IndexedDB` for persisting data locally in the browser.

##  Tech Stack

-   **Frontend**: [React](https://reactjs.org/), [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/), [@tanstack/react-query](https://tanstack.com/query/v4)
-   **Routing**: [React Router](https://reactrouter.com/)
-   **API Mocking**: [Mock Service Worker (MSW)](https://mswjs.io/)
-   **Local Database**: [Dexie.js](https://dexie.org/) (wrapper for IndexedDB)
-   **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

##  Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18.x or higher recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/Harshroxnox/talent-flow.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd talent-flow
    ```
3.  Install the dependencies:
    ```sh
    npm install
    ```

### Running the Development Server

To start the development server, run:

```sh
npm run dev
```
The application will be available at http://localhost:5173.

## 📂 Project Structure
The project follows a feature-based structure to keep the codebase organized and scalable.


```sh
/src
├── api/         # Functions for fetching data (interacts with MSW)
├── app/         # Core app setup (React Query client, DB, MSW)
├── assets/      # Static assets like images and SVGs
├── components/  # Reusable UI components
├── hooks/       # Custom React hooks
├── pages/       # Top-level page components for each route
├── styles/      # Global styles
├── utils/       # Utility functions
└── main.jsx     # App entry point
```
## Future Aspects

While TalentFlow is currently a robust client-side application, there are several exciting features planned for the future:

-   **Full Backend Integration**: Replace the mock API with a real backend service (e.g., Node.js, Express, and a database like PostgreSQL or MongoDB) to support multiple users and persistent data storage.
-   **User Authentication**: Implement a complete authentication system with user roles (Admin, HR Manager) to manage access control.
-   **Real-time Updates**: Integrate WebSockets to provide real-time updates, such as instant changes on the candidate Kanban board.
-   **Automated Email Notifications**: Set up automated emails to candidates when their application status changes.
-   **Advanced Analytics**: Enhance the HR dashboard with more detailed analytics, such as time-to-hire and candidate source tracking.
-   **Cloud Deployment**: Deploy the application to a cloud platform like Vercel, Netlify, or AWS for public access.