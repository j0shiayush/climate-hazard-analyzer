import { useState } from 'react';
import axios from 'axios';
import { AlertCircle, ThermometerSun, Activity, MapPin } from 'lucide-react';
import MapSelector from './components/MapSelector';
import TrendCharts from './components/TrendCharts';

function App() {
  const [position, setPosition] = useState({ lat: 28.6139, lon: 77.2090 }); // Default: Delhi
  const [years, setYears] = useState({ start: 1990, end: 2023 });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/api/v1/analyze/', {
        lat: position.lat,
        lon: position.lon,
        start_year: years.start,
        end_year: years.end,
        hazard_type: "heatwave"
      });
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch climate data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-lg text-red-600">
            <ThermometerSun size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Climate Hazard Trend Analyzer</h1>
            <p className="text-gray-500 text-sm">Analyze historical heatwave frequency and intensity.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls Sidebar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin size={16}/> Select Region (Click Map)
              </label>
              <MapSelector position={position} setPosition={setPosition} />
              <div className="mt-2 text-xs text-gray-500">
                Lat: {position.lat.toFixed(4)}, Lon: {position.lon.toFixed(4)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
                <input 
                  type="number" 
                  value={years.start} 
                  onChange={(e) => setYears({...years, start: parseInt(e.target.value)})}
                  className="w-full border-gray-300 rounded-lg shadow-sm p-2 border"
                  min="1950" max="2022"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                <input 
                  type="number" 
                  value={years.end} 
                  onChange={(e) => setYears({...years, end: parseInt(e.target.value)})}
                  className="w-full border-gray-300 rounded-lg shadow-sm p-2 border"
                  min="1951" max="2024"
                />
              </div>
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Activity className="animate-spin" /> : <ThermometerSun />}
              {loading ? 'Analyzing Data...' : 'Analyze Climate Trends'}
            </button>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex gap-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Results Area */}
          <div className="md:col-span-2 space-y-6">
            {results ? (
              <>
                {/* Insights Banner */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100">
                  <h3 className="text-lg font-bold text-orange-900 mb-2">Statistical Insights</h3>
                  <p className="text-orange-800">{results.insights.summary_text}</p>
                  <div className="mt-4 flex gap-4 text-sm font-medium">
                    <span className="bg-white px-3 py-1 rounded-full text-orange-700 shadow-sm">
                      Base 95th Percentile: {results.baseline_threshold_celsius}°C
                    </span>
                    <span className="bg-white px-3 py-1 rounded-full text-orange-700 shadow-sm">
                      Total Events: {results.events.length}
                    </span>
                  </div>
                </div>
                
                <TrendCharts data={results.annual_stats} />
              </>
            ) : (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-gray-400">
                <MapPin size={48} className="mb-4 opacity-50" />
                <p>Select a region and time period to view climate trends.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;