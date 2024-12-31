# 🎯 Streaming Package Optimizer

Welcome to my solution for the CHECK24 GenDev Streaming Package Comparison Challenge! This project helps football fans find the perfect combination of streaming packages to watch their favorite teams without breaking the bank. Think of it as having your own personal streaming consultant! 🧙‍♂️

## 🌟 Features

- **Smart Team Selection**: Search and select multiple teams with autocomplete
- **Package Coverage Analysis**: See exactly what percentage of games each package covers
- **Intelligent Combination Finding**: Two-pronged approach to find the best package combinations:
  - Primary algorithm focuses on finding 100% coverage with minimum cost
  - Backup algorithm kicks in when perfect coverage isn't possible, finding the best partial coverage
- **Price Optimization**: Compare monthly vs yearly subscriptions
- **Flexible Filtering**: Filter by price range and subscription type
- **Visual Coverage Indicators**: Color-coded coverage percentages make it easy to understand what you're getting

## 🏗️ Architecture

### Backend (Django + PostgreSQL)

The backend implements a sophisticated package optimization system with several key components:

- **Package Finding Algorithm**: Two-stage approach:

  1. **Primary Algorithm** (`PackageCombinationView`):

     - First includes all free packages
     - Generates combinations of paid packages up to max size
     - Returns only 100% coverage solutions
     - Optimizes for both monthly and yearly pricing

  2. **Backup Algorithm** (`PackageCombinationViewBackup`):
     - Kicks in when 100% coverage isn't possible
     - Greedy approach prioritizing coverage/price ratio
     - Returns best possible partial coverage solution
     - Smart package sorting by coverage contribution

### Frontend (React + Material-UI)

- Clean, responsive UI with Material Design
- Real-time filtering and sorting
- Dynamic coverage visualization
- Optimistic UI updates for smooth user experience

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- That's it! Everything else is containerized 🐳

### Quick Start

1. Clone the repository
2. Run:

```bash
docker-compose up --build
```

3. Visit `http://localhost:3000` - You're ready to go! 🎉

### The Magic Behind the Scenes

The docker-compose setup includes:

- Frontend container (Port 3000)
- Backend container (Port 8000)
- PostgreSQL container (Port 5432)

The system automatically:

- Sets up the database
- Imports all necessary data
- Establishes connections between services
- Handles hot reloading for development

## 💡 Technical Details

### Performance Optimizations

- **Database**:

  - Efficient indexing on game and team queries
  - Prefetching related data to minimize queries
  - Bulk operations for data import

- **Algorithms**:
  - Set operations for quick coverage calculations
  - Early termination when optimal solution found
  - Smart sorting to prioritize promising combinations

### API Endpoints

- `GET /api/teams/`: Get all teams
- `GET /api/teams/search/`: Search teams by name
- `GET /api/packages/`: List all packages
- `POST /api/packages/by-teams/`: Get packages for selected teams
- `POST /api/packages/by-teams-soft/`: Get packages with coverage percentage
- `POST /api/packages/combinations/`: Get optimal package combinations
- `POST /api/packages/combinations-backup/`: Get best possible combination when 100% coverage isn't possible

## 🎨 UI Features

- Intuitive team selection with autocomplete
- Real-time coverage updates
- Price range slider for easy filtering
- Clear visual distinction between monthly and yearly options
- Color-coded coverage indicators

## 📝 Design Decisions

1. **Two-Algorithm Approach**:

   - Primary algorithm for perfect solutions
   - Backup algorithm for best-effort solutions
   - Ensures users always get useful recommendations

2. **Frontend Architecture**:

   - Component-based design for reusability
   - Centralized state management
   - Responsive design principles

3. **Error Handling**:
   - Graceful degradation
   - Clear user feedback
   - Automatic fallback to backup algorithm

## 📫 Questions?

Feel free to reach out if you have any questions or suggestions!
