# Airesumescore
Just upload your resume and get the score and ATS Check

Open your terminal in the root project directory.

Step 1: Build all containers
docker compose build

Step 2: Start all services
docker compose up -d

Step 3: Check running containers
docker compose ps

Step 4: View logs
docker compose logs -f

Step 5: Stop containers
docker compose down

Step 6: Stop containers and delete database volume
docker compose down -v