import { useState, useRef } from 'react';
import axios from 'axios';
import { AlertCircle, ThermometerSun, Activity, Download, FileText, Map } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import MapSelector from './components/MapSelector';
import TrendCharts from './components/TrendCharts';
import LocationSearch from './components/LocationSearch';

function App() {
  const [position, setPosition] = useState({ lat: 28.6139, lon: 77.2090, name: "New Delhi" });
  const [years, setYears] = useState({ start: 1990, end: 2023 });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  const reportRef = useRef(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('https://climate-hazard-analyzer-d9i8.onrender.com/api/v1/analyze/', {
        lat: position.lat,
        lon: position.lon,
        start_year: years.start || 1990, 
        end_year: years.end || 2023,
        hazard_type: "heatwave"
      });
      setResults(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(`Validation Error: ${detail[0].loc.join('.')} - ${detail[0].msg}`);
      } else {
        setError(detail || "Failed to fetch climate data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!results) return;
    const headers = ["Start Date,End Date,Duration (Days),Peak Temp (°C),Avg Temp (°C)"];
    const rows = results.events.map(e => `${e.start_date},${e.end_date},${e.duration_days},${e.peak_tmax},${e.avg_tmax}`);
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `climate_hazard_${years.start}_${years.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save(`climate_report_${years.start}_${years.end}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-inner flex items-center justify-center p-1.5 border border-red-100">
  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
</div>
            <div>
              <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500">
                Climate Hazard Trend Analyzer
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-1">Analyze historical heatwave frequency and intensity.</p>
            </div>
          </div>
          
          {results && (
            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={exportCSV} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-semibold text-gray-700 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-95">
                <FileText size={18} /> Export CSV
              </button>
              <button onClick={exportPDF} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl shadow-md text-sm font-semibold text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95">
                <Download size={18} /> Download PDF
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 space-y-6 h-fit">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">

<Map size={18} className="text-red-500"/>
Search & Select Region
              </label>
              <LocationSearch onLocationSelect={setPosition} />
              <MapSelector position={position} setPosition={setPosition} />
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-xs text-gray-500 truncate font-medium">📍 {position.name || 'Selected Map Point'}</p>
                <p className="text-xs text-gray-400 mt-1">Lat: {position.lat.toFixed(4)}, Lon: {position.lon.toFixed(4)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Start Year</label>
                <input 
                  type="number" 
                  value={years.start} 
                  onChange={(e) => setYears({...years, start: parseInt(e.target.value)})}
                  className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">End Year</label>
                <input 
                  type="number" 
                  value={years.end} 
                  onChange={(e) => setYears({...years, end: parseInt(e.target.value)})}
                  className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                />
              </div>
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? <Activity className="animate-spin" /> : <ThermometerSun size={20} />}
              {loading ? 'Crunching Climate Data...' : 'Analyze Trends'}
            </button>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium flex gap-3 border border-red-100 animate-pulse">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            {results ? (
              <div ref={reportRef} className="space-y-6 bg-white p-2 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100 shadow-inner">
                  <h3 className="text-xl font-extrabold text-orange-900 mb-2">
                    Insights for {position.name ? position.name.split(',')[0] : 'Selected Region'} ({years.start} - {years.end})
                  </h3>
                  <p className="text-orange-800 font-medium leading-relaxed">{results.insights.summary_text}</p>
                  <div className="mt-5 flex flex-wrap gap-4 text-sm font-bold">
                    <span className="bg-white px-4 py-2 rounded-xl text-orange-700 shadow-sm border border-orange-100 flex items-center gap-2 hover:scale-105 transition-transform">
                      🔥 Base 95th Percentile: {results.baseline_threshold_celsius}°C
                    </span>
                    <span className="bg-white px-4 py-2 rounded-xl text-orange-700 shadow-sm border border-orange-100 flex items-center gap-2 hover:scale-105 transition-transform">
                      📈 Total Heatwave Events: {results.events.length}
                    </span>
                  </div>
                </div>
                
                <TrendCharts data={results.annual_stats} />
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 shadow-md border border-gray-100 h-full flex flex-col items-center justify-center text-gray-400 bg-opacity-50">
                <div className="p-6 bg-gray-50 rounded-full mb-4">
                  <Map size={48} className="opacity-40" />
                </div>
                <p className="text-lg font-medium text-gray-500">Search a region or drop a pin to view trends.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;