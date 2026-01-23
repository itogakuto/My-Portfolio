import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { TopicsList } from './pages/TopicsList';
import { TopicDetail } from './pages/TopicDetail';
import { Admin } from './pages/Admin';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/topics" element={<TopicsList />} />
        <Route path="/topics/:slug" element={<TopicDetail />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
};

export default App;