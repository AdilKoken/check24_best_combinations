#!/bin/bash

# Create root project directory
mkdir -p streaming-package-comparison
cd streaming-package-comparison

# Create frontend directory structure
mkdir -p frontend/src/components
mkdir -p frontend/src/types
mkdir -p frontend/public

# Create backend directory structure
mkdir -p backend/src/routes
mkdir -p backend/src/controllers
mkdir -p backend/src/models
mkdir -p backend/src/config

# Create Docker configuration
touch docker-compose.yml
touch frontend/Dockerfile
touch backend/Dockerfile

# Create frontend configuration files
touch frontend/package.json
touch frontend/tsconfig.json
touch frontend/tailwind.config.js

# Create frontend source files
touch frontend/src/App.tsx
touch frontend/src/index.tsx
touch frontend/src/components/Layout.tsx
touch frontend/src/components/TeamSelection.tsx
touch frontend/src/components/PackageComparison.tsx
touch frontend/src/types/index.ts

# Create backend configuration files
touch backend/package.json
touch backend/tsconfig.json

# Create backend source files
touch backend/src/index.ts
touch backend/src/config/database.ts

# Create root README
touch README.md