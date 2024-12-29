#!/bin/sh

# Exit on any error
set -e

# Function to test postgres connection
postgres_ready() {
python << END
import sys
import psycopg2
try:
    psycopg2.connect(
        dbname="${POSTGRES_DB}",
        user="${POSTGRES_USER}",
        password="${POSTGRES_PASSWORD}",
        host="${POSTGRES_HOST}",
        port="5432"
    )
except psycopg2.OperationalError:
    sys.exit(-1)
sys.exit(0)
END
}

until postgres_ready; do
  echo "Waiting for PostgreSQL to become available..."
  sleep 1
done
echo "PostgreSQL is available"

echo "Running migrations..."
python manage.py migrate

echo "Importing initial data..."
python manage.py import_data

echo "Starting server..."
exec "$@"