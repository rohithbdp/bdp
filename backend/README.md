# Portfolio Backend - Contact Form API

A simple Go backend service to handle contact form submissions from the portfolio website.

## Setup

1. **Install Go** (if not already installed)
   - Download from https://golang.org/

2. **Clone and navigate to backend**
   ```bash
   cd /Users/rohith.bolamala/portfolio/backend
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add:
   - `EMAIL_FROM`: Your Gmail address
   - `EMAIL_PASSWORD`: Your Gmail App Password (not regular password)
   - `PORT`: Server port (default: 8080)

   **To get Gmail App Password:**
   1. Go to https://myaccount.google.com/security
   2. Enable 2-factor authentication
   3. Search for "App passwords"
   4. Generate a new app password for "Mail"

4. **Install dependencies**
   ```bash
   go mod download
   ```

5. **Run the server**
   ```bash
   go run main.go
   ```

## Deployment Options

### Option 1: Deploy to Render (Free)
1. Push backend to GitHub
2. Connect to Render.com
3. Create new Web Service
4. Set environment variables
5. Deploy

### Option 2: Deploy to Railway
1. Install Railway CLI
2. Run `railway login`
3. Run `railway init`
4. Set environment variables
5. Run `railway up`

### Option 3: Deploy to Google Cloud Run
1. Install gcloud CLI
2. Build and deploy:
   ```bash
   gcloud run deploy portfolio-backend --source .
   ```

## API Endpoint

- **POST** `/api/contact`
  - Body: `{"name": "string", "email": "string", "message": "string"}`
  - Response: `{"status": "success", "message": "Message sent successfully!"}`

## Testing

Test the endpoint:
```bash
curl -X POST http://localhost:8080/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Hello!"}'
```