import HomePage from './pages/HomePage';
import ExportPage from './pages/ExportPage';

function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (path === '/export') return <ExportPage />;
  return <HomePage />;
}

export default App;
