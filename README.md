# 🌡️ Climate Hazard Trend Analyzer

A full-stack web application that analyzes historical weather data to detect and visualize climate hazard trends (specifically heatwaves) for any geographic region over time. Built as a comprehensive solution for the Dygnify Ventures Full-Stack Developer Case Study.

## 🚀 Live Demo & Links

- **Frontend URL:** [Insert Vercel/Netlify Link Here]
- **Backend API URL:** [Insert Render/Railway Link Here]
- **Demo Video:** [Insert Loom/Google Drive Link Here]

<img width="1458" height="928" alt="image" src="https://github.com/user-attachments/assets/b7bb9152-8995-4531-ae1e-cfecfd5e9958" />

---

## 🏗️ Architecture & Tech Stack

This project follows a modular, decoupled architecture prioritizing performance, accurate mathematical modeling, and user experience.

### Frontend
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS (with glassmorphism and custom gradients)
- **Visualizations:** Recharts for responsive, interactive time-series data
- **Mapping:** Leaflet & `react-leaflet` with OpenStreetMap tiles

### Backend
- **Framework:** Python / FastAPI (Fully asynchronous)
- **Data Processing:** Pandas, NumPy
- **Statistical Engine:** SciPy (Linear Regression), `pymannkendall` (Mann-Kendall Trend Test)
- **Database/Caching:** MongoDB Atlas (using `motor` async driver)
- **API Security:** `slowapi` (Rate Limiting), Pydantic (Strict input validation)

### Data Source
- **Primary Source:** [Open-Meteo Historical Weather API](https://open-meteo.com/) (No API key required, high-resolution daily metrics).

---

## ✨ Key Features & Bonus Challenges Implemented

### 1. Advanced Region Selection (Map & Search)
Users can drop a pin on an interactive map or use the integrated **Nominatim API Search Bar** with debounce to find specific cities (e.g., typing "Delhi" auto-suggests and smoothly flies the map to the coordinates).

<img width="454" height="744" alt="image" src="https://github.com/user-attachments/assets/0f63743a-40a8-4cad-9838-fad404924271" />

### 2. Time-Series Visualizations
Dynamic charts display the annual frequency of heatwave events and the maximum intensity (peak temperature) recorded during those events over the selected decades.

<img width="1341" height="748" alt="image" src="https://github.com/user-attachments/assets/ef027e53-9861-4843-b1c2-74f44ee6896e" />

### 3. PDF & CSV Export Suite (Bonus Challenge 2)
Directly from the UI, users can export the raw hazard event data as a `.csv` file or download a formatted executive `.pdf` report of the insights and charts (powered by `jsPDF` and `html2canvas`).

### 4. Rigorous Statistical Trend Detection (Bonus Challenge 3)
Instead of basic averages, the backend applies two statistical models to the annual event counts:
- **Ordinary Least Squares (OLS) Linear Regression**
- **Mann-Kendall Trend Test:** A non-parametric test ideal for detecting monotonic upward or downward trends in climate data, outputting a precise p-value to determine statistical significance.

---

## 🔬 Domain Logic: Heatwave Detection & Assumptions

The core climate logic follows standard climatological definitions (similar to IPCC/WMO indices) rather than arbitrary fixed temperatures.

**The Logic:**
1. **Baseline Threshold:** The system calculates the **95th percentile** of all daily maximum temperatures ($T_{max}$) across the selected time period for the chosen coordinates.
2. **Event Flagging:** A heatwave is strictly defined as **3 or more consecutive days** where the daily $T_{max}$ exceeds this regional 95th percentile baseline. 

**Assumptions Made:**
- The 95th percentile is calculated over the entire requested time span (e.g., 1990-2023) rather than a fixed 30-year historical baseline (like 1961-1990). This provides a relative measure of extremes for the specific period the user is querying.
- Missing data from the Open-Meteo API is handled using forward-fill (`ffill` in Pandas) to prevent breaks in consecutive day logic.
- Timezone is set to `auto` based on the requested coordinates.

---

## 🛠️ Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MongoDB (Local instance or Atlas URI)

### Backend Setup
1. Open terminal and navigate to the backend folder:
   `cd backend`
2. Create and activate a virtual environment:
   `python -m venv venv`
   `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
3. Install dependencies:
   `pip install -r requirements.txt`
4. Create a `.env` file in the `/backend` directory and add:
   `MONGODB_URL=your_mongodb_connection_string`
   `DB_NAME=climate_hazard_db`
5. Start the server:
   `uvicorn main:app --reload` (Runs on http://localhost:8000)

### Frontend Setup
1. Open a new terminal tab and navigate to the frontend folder:
   `cd frontend`
2. Install dependencies:
   `npm install`
3. Start the Vite development server:
   `npm run dev` (Runs on http://localhost:5173)

---

## 🤖 AI Tools Disclosure

In accordance with the assignment guidelines, Generative AI (Google Gemini) was utilized as a collaborative thought partner during this project to:
- Scaffold boilerplate configurations (FastAPI routing, Vite setup, Tailwind configurations).
- Advise on the integration and syntax of the `pymannkendall` statistical test in Python.
- Troubleshoot UI CSS rendering issues with Leaflet maps and standardize Pydantic JSON serialization (`numpy.bool` errors).
- Generate the SVG code for the custom dashboard logo.

*All core architectural decisions, data modeling, API integration logic, and final code validations were actively directed, reviewed, and verified by me.*

---

## 🔮 What I Would Improve With More Time

1. **Multi-Hazard Expansion:** Extend the detection engine to analyze droughts (using the Standardized Precipitation Index - SPI) and extreme rainfall events (days exceeding the 99th percentile of precipitation).
2. **Advanced Caching:** Implement an in-memory datastore like **Redis** in front of MongoDB for near-instantaneous repetitive region queries.
3. **Automated Testing:** Build a comprehensive `pytest` suite simulating edge cases like leap years, massive dataset gaps, and boundary coordinate queries.
4. **Seasonal Baselines:** Upgrade the heatwave logic to use a moving 15-day window centered on each calendar day, rather than a flat annual 95th percentile, to accurately detect out-of-season heat anomalies (e.g., winter heatwaves).
