import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/ui/Layout';
import Dashboard from './components/Dashboard';
import FoodChat from './components/FoodChat';
import FoodLog from './components/FoodLog';
import Profile from './components/Profile';
import Progress from './components/Progress';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat" element={<FoodChat />} />
          <Route path="/history" element={<FoodLog />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
