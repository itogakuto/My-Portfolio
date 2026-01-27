import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { TopicsList } from './pages/TopicsList';
import { TopicDetail } from './pages/TopicDetail';
import { ExperienceList } from './pages/ExperienceList';
import { Admin } from './pages/Admin';
import { LoadingScreen } from './components/LoadingScreen';

// 画面遷移を監視してローディングを表示するラッパー
const RouteChangeTracker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);

  // 初回ロード完了
  const handleInitialComplete = () => {
    setIsInitialLoad(false);
  };

  // ページ遷移完了
  const handleNavComplete = () => {
    setIsNavigating(false);
  };

  useEffect(() => {
    // パスが変わった時だけ遷移ローディングを出す
    if (prevPath !== location.pathname) {
      // 管理画面（/admin）への移動はローディングを出さない（更新時のUX考慮）
      if (!location.pathname.startsWith('/admin') && !prevPath.startsWith('/admin')) {
        setIsNavigating(true);
      }
      setPrevPath(location.pathname);
      window.scrollTo(0, 0);
    }
  }, [location.pathname, prevPath]);

  return (
    <>
      {isInitialLoad && (
        <LoadingScreen onComplete={handleInitialComplete} isInitial={true} />
      )}
      {!isInitialLoad && isNavigating && (
        <LoadingScreen onComplete={handleNavComplete} isInitial={false} />
      )}
      {children}
    </>
  );
};

//ルーティング設定
const App: React.FC = () => {
  return (
    <Router>
      <RouteChangeTracker>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/topics" element={<TopicsList />} />
          <Route path="/topics/:slug" element={<TopicDetail />} />
          <Route path="/experiences" element={<ExperienceList />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </RouteChangeTracker>
    </Router>
  );
};

export default App;