# Streaming Package Comparison Application

## Project Setup

### Prerequisites

- Docker
- Docker Compose

### Running the Application

1. Clone the repository

```bash
git clone <repository-url>
cd <project-directory>
```

2. Start the application using Docker Compose

```bash
docker-compose up --build
```

3. The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Initial Database Setup

The database will be automatically set up when you first run the application. The following will happen automatically:

- Database creation
- Migrations
- Initial data import from CSV files

### API Endpoints

- `GET /api/teams/` - Get all teams
- `GET /api/teams/search/?query=` - Search teams
- `POST /api/packages/compare/` - Compare packages for selected teams
- `POST /api/packages/combinations/` - Get optimal package combinations
- `GET /api/packages/` - List all packages
- `POST /api/games/teams/` - Get games for selected teams

## Development

To run tests or make migrations within the Docker container:

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Import initial data
docker-compose exec backend python manage.py import_data
```
