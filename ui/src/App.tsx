import { CssBaseline } from '@mui/material';
import Header from './components/Header';
import MapComponent from './components/MapComponent';
import './App.css';

function App() {
  return (
    <div className="app-root">
      <CssBaseline />
      <Header />
      <div className="map-container">
        <MapComponent />
      </div>
    </div>
  );
}

export default App;
