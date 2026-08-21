.PHONY: help dev-backend dev-frontend docker-up docker-down docker-logs test clean

help:
	@echo "Razorpay Autonomous Revenue Recovery Engine - DevOps Automation"
	@echo ""
	@echo "  make dev-backend     - Run FastAPI backend server locally"
	@echo "  make dev-frontend    - Run Vite React frontend server locally"
	@echo "  make docker-up       - Spin up full stack (Backend, Frontend, Mongo, Redis) with Docker Compose"
	@echo "  make docker-down     - Stop and remove Docker containers"
	@echo "  make docker-logs     - Tail real-time Docker Compose container logs"
	@echo "  make test            - Verify backend compilation and frontend build"
	@echo "  make clean           - Remove build artifacts and temporary files"

dev-backend:
	cd backend && ./venv/bin/uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

test:
	cd frontend && npm run build
	cd backend && ./venv/bin/python -c "from app.main import app; print('Backend Verified!')"

clean:
	rm -rf frontend/dist
	find . -type d -name "__pycache__" -exec rm -rf {} +
