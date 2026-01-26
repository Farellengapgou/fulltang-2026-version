#!/bin/bash

# Script to migrate SQLite to PostgreSQL using Docker

echo "🚀 Starting migration from SQLite to PostgreSQL..."

# 1. Stop existing containers
echo "🛑 Stopping containers..."
docker-compose down

# 2. Dump data from SQLite (needs local environment to run dumpdata or run inside container if sqlite exists)
# Since we might not have django installed locally or env issues, we will try to use the current db.sqlite3
# However, dumpdata is a django command.
# If you are running locally without docker first:
echo "📦 Dumping data from SQLite..."
python3 manage.py dumpdata --exclude contenttypes --exclude auth.permission --exclude admin.logentry --exclude sessions.session --indent 2 > data.json

if [ ! -f data.json ]; then
    echo "❌ Dump failed! data.json not found."
    exit 1
fi

echo "✅ Data dumped to data.json"

# 3. Build and start containers with Postgres
echo "🐳 Building and starting containers..."
docker-compose up -d --build db
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10 # Wait for DB to initialize

docker-compose up -d fultang

echo "⏳ Waiting for Fultang app to be ready..."
sleep 15

# 4. Load data into PostgreSQL
echo "📥 Loading data into PostgreSQL..."
docker-compose exec fultang python manage.py migrate
docker-compose exec fultang python manage.py loaddata data.json

echo "✅ Migration completed! You can now access the application."
echo "🧹 Cleanup: You can remove data.json if everything looks good."
