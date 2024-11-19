# Streaming Package Comparison

A web application to compare streaming packages for sports events, built with Django and React.

## Features

- Compare streaming packages for multiple teams
- Filter packages based on various criteria
- Find optimal package combinations
- Interactive user interface

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. Clone the repository:
```bash
git clone <your-repository-url>
cd streaming-comparison
```

2. Start the application:
```bash
docker-compose up --build
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api

## Project Structure

- `backend/`: Django REST API
- `frontend/`: React application
- `docker-compose.yml`: Docker composition configuration

## Development

To run the development environment:

```bash
docker-compose up
```

Any changes to the code will automatically reload the applications.
