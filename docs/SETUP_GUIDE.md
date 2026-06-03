# Setup Guide

## Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (local or cloud)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/khushal280303/municipal-cooperation
   cd municipal-cooperation
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Setup Backend Environment**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your MongoDB URI and other configuration
   ```

4. **Setup Frontend Environment**
   ```bash
   cd ../client
   # No .env needed for basic setup
   ```

5. **Run Development Servers**
   From the root directory:
   ```bash
   npm run dev
   ```
   
   Or run separately:
   ```bash
   # Terminal 1
   npm run server
   
   # Terminal 2
   npm run client
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - API: http://localhost:5000

## Database Setup

1. Start MongoDB service
2. Create database `municipal-cooperation`
3. Models will auto-create collections on first use

## Configuration

Update `.env` with:
- MongoDB connection string
- JWT secret
- Email credentials (for notifications)
- API keys (if using external services)
