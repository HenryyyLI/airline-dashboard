# ✈️ Airline Review Analytics Dashboard

A full-stack analytics platform that scrapes, analyzes, and visualizes airline reviews through advanced web scraping, machine learning-powered sentiment analysis, and interactive data visualizations. The system integrates Scrapy for automated data collection, RoBERTa-based NLP with LIME explainability, PostgreSQL for robust data management, and React-based dashboard for intuitive data exploration.

## 🔍 Key Features

- **🗃️ Optimized PostgreSQL Database Architecture**

  Implements normalized relational schemas with foreign key constraints and indexed queries for efficient data retrieval. Leverages psycopg's async capabilities to handle concurrent API requests without blocking, ensuring low-latency responses under high traffic.

- **⚡ React 18 with Client-Side Routing**

  Client-side routing via React Router enables seamless navigation between Dashboard, Review Data, and Analytics pages. Axios handles all API communication with custom interceptors for centralized error handling. Zustand manages global state efficiently, minimizing re-renders through selective subscriptions.

- **🕷️ Production-Ready Scrapy Pipeline**

  Distributed spider architecture with custom middleware for request throttling, user-agent rotation, and automatic retry logic. Handles pagination traversal and DOM parsing via PyQuery, storing structured data directly to PostgreSQL through pipeline processors.

- **🤖 Transformer-Based Sentiment Analysis**

  Deploys pre-trained RoBERTa with PyTorch backend for sentiment classification. LIME explainer generates token-level attribution scores, enabling interpretable ML predictions. Scikit-learn models quantify feature importance across service dimensions.

- **🎨 Modern UI Components & Styling**

  Tailwind CSS utility classes enable rapid styling and maintainable design. ShadcnUI provides accessible, pre-built components. Framer Motion adds smooth animations, while react-hot-toast delivers instant user feedback through notifications.

## 📁 Project Structure

```bash
airline-dashboard/
├── backend/                          # Backend - FastAPI + PostgreSQL + NLP
│   ├── main.py                       # FastAPI application and API endpoints
│   ├── postgres_db.py                # PostgreSQL client with query methods
│   ├── sentModel.py                  # RoBERTa sentiment analysis with LIME
│   ├── worldcities.csv               # Geographic data for route mapping
│   └── worldcities.xlsx              # City coordinates for visualization
│
├── myspider/                         # Web Scraper - Scrapy Framework
│   ├── myspider/
│   │   ├── spiders/
│   │   │   └── reviews.py            # Main spider for scraping reviews
│   │   ├── items.py                  # Data models for scraped items
│   │   ├── pipelines.py              # Data processing pipeline
│   │   ├── settings.py               # Scrapy configuration
│   │   └── middlewares.py            # Custom middleware
│   └── postgres_db.py                # Database insertion logic
│
├── src/                              # Frontend - React + Tailwind CSS
│   ├── components/
│   │   ├── Cards/                    # Dashboard card components
│   │   ├── NavBar/                   # Navigation components
│   │   ├── Footer/                   # Footer component
│   │   └── ui/                       # ShadcnUI components
│   ├── pages/
│   │   ├── dashboard/                # Main dashboard page
│   │   ├── reviewdata/               # Review explorer page
│   │   └── analytics/                # Advanced analytics page
│   ├── hooks/
│   │   └── useFetch.js               # Custom fetch hook for API calls
│   ├── zustand/
│   │   └── useContext.js             # Zustand state management
│   ├── lib/
│   │   └── utils.js                  # Utility functions
│   ├── App.jsx                       # Main app component with routing
│   └── main.jsx                      # Application entry point
│
├── .env                              # Environment variables
├── .gitignore                        # Git ignored files
└── README.md                         # Project documentation
```

## 🛠️ Tech Stack

- **Backend**: `FastAPI`, `Python`, `uvicorn`, `PostgreSQL`, `psycopg`

- **Machine Learning**: `twitter-roberta-base-sentiment`, `PyTorch`, `LIME`, `scikit-learn`, `nltk`

- **Web Scraping**: `Scrapy`, `PyQuery`

- **Frontend**: `React 18`, `React Router`, `Vite`, `Axios`

- **UI & Styling**: `Tailwind CSS`, `ShadcnUI`, `react-hot-toast`, `framer-motion`

- **State Management**: `Zustand`

- **Data Processing**: `numpy`, world cities dataset

## ⚙️ Dependencies

- **Python 3.8+** — Required for backend API and ML models
   👉 [Download Python](https://www.python.org/downloads/)

- **Node.js 16+** — Required for React frontend
   👉 [Download Node.js](https://nodejs.org/en/download)

- **PostgreSQL 13+** — Database for storing airlines, reviews, and sentiment data
   👉 [Download PostgreSQL](https://www.postgresql.org/download/)

## 🚀 Setup & Usage

1. **Clone the repository**

   ```bash
   git clone https://github.com/HenryyyLI/airline-dashboard.git
   cd airline-dashboard
   ```

2. **Configure environment variables**

   ```bash
   # Create .env file in backend directory
   cd backend
   echo "POSTGRES_DSN=postgresql://user:password@localhost:5432/airline" > .env
   ```

3. **Install dependencies**

   ```bash
   # Install backend dependencies
   cd backend
   pip install -r requirements.txt
   
   # Install frontend dependencies
   cd ../src
   npm install
   ```

4. **Set up the database**

   ```bash
   # Create PostgreSQL database
   psql -U postgres -c "CREATE DATABASE airline;"
   
   # Run migrations (create tables for airlines, reviews, sentiment)
   # Execute schema SQL files or use your migration tool
   ```

5. **Run the web scraper** (Optional - populate database)

   ```bash
   cd myspider
   scrapy crawl reviews
   ```

6. **Start backend & frontend**

   ```bash
   # Start backend server (from backend directory)
   uvicorn main:app --reload --port 8000
   
   # Start frontend dev server (from src directory, in new terminal)
   npm run dev
   ```

## 📧 Contact

Henry Li - [GitHub Profile](https://github.com/HenryyyLI)

Project Link: [https://github.com/HenryyyLI/airline-dashboard](https://github.com/HenryyyLI/airline-dashboard)

---

⭐ If you find this project useful, please consider giving it a star!
