# CinnaCeylon Full Stack Application

A full-stack web application for managing cinnamon products and inventory.

## 🚀 Quick Start

### Option 1: Run Both Servers Simultaneously (Recommended)
```bash
npm run dev
```

### Option 2: Run Servers Separately

**Backend Server (Port 5000):**
```bash
npm run backend
```

**Frontend Server (Port 3002):**
```bash
npm run frontend
```

## 📁 Project Structure

```
Cinna-Ceylon/
├── backend/          # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   └── uploads/      # Image uploads
└── frontend/         # React frontend
    ├── src/
    │   ├── components/
    │   └── App.jsx
    └── public/
```

## 🔧 Configuration

### Backend
- **Port**: 5000 (configurable via .env file)
- **Database**: MongoDB (configure in .env)
- **API Base URL**: `http://localhost:5000/api`

### Frontend
- **Port**: 3002
- **Development Server**: `http://localhost:3002`
- **API Proxy**: Configured to forward `/api` requests to backend

## 🌐 Access Points

- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000 (root endpoint)

## 🔍 Troubleshooting

### Port Conflicts
If you get port conflicts:
1. Check if ports 3002 and 5000 are available
2. Kill any processes using these ports
3. Or change ports in the configuration files

### CORS Issues
The backend is configured with CORS to allow requests from the frontend. If you still have issues:
1. Ensure both servers are running
2. Check that the frontend is making requests to the correct backend URL
3. Verify the proxy configuration in webpack.config.js

## 📦 Dependencies

### Root Dependencies
- `concurrently`: Run multiple commands simultaneously

### Backend Dependencies
- `express`: Web framework
- `mongoose`: MongoDB ODM
- `cors`: Cross-origin resource sharing
- `multer`: File upload handling

### Frontend Dependencies
- `react`: UI library
- `react-router-dom`: Routing
- `tailwindcss`: Styling
- `framer-motion`: Animations

## 🛠️ Development

### Installing Dependencies
```bash
npm run install-all
```

### Building for Production
```bash
npm run build
```

## 📝 API Endpoints

- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get specific product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

And many more endpoints for cart, orders, inventory, etc.
