import Layout from "./Layout.jsx";

import Landing from "./Landing";

import Crisis from "./Crisis";

import ParentDashboard from "./ParentDashboard";

import StudentChat from "./StudentChat";

import MoodTracker from "./MoodTracker";

import WellnessTools from "./WellnessTools";

import AICoaching from "./AICoaching";

import RiskMonitor from "./RiskMonitor";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Landing: Landing,
    
    Crisis: Crisis,
    
    ParentDashboard: ParentDashboard,
    
    StudentChat: StudentChat,
    
    MoodTracker: MoodTracker,
    
    WellnessTools: WellnessTools,
    
    AICoaching: AICoaching,
    
    RiskMonitor: RiskMonitor,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Landing />} />
                
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/Crisis" element={<Crisis />} />
                
                <Route path="/ParentDashboard" element={<ParentDashboard />} />
                
                <Route path="/StudentChat" element={<StudentChat />} />
                
                <Route path="/MoodTracker" element={<MoodTracker />} />
                
                <Route path="/WellnessTools" element={<WellnessTools />} />
                
                <Route path="/AICoaching" element={<AICoaching />} />
                
                <Route path="/RiskMonitor" element={<RiskMonitor />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}