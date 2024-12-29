FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DOCKER_CONTAINER 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
   && apt-get install -y --no-install-recommends \
   postgresql-client \
   gcc \
   python3-dev \
   musl-dev \
   && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create directory for data files
RUN mkdir -p /app/data

# Copy project
COPY . .

# Create media and static directories
RUN mkdir -p /app/staticfiles /app/mediafiles

# Make entrypoint script executable
RUN chmod +x entrypoint.sh

# Run the application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]