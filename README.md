# MongoDB Data Exploration Tool with GST Integration

A full-stack web application for exploring MongoDB data with GST calculation capabilities built using Node.js, Express, React.js, and Material UI.

## Features

- Browse MongoDB collections and data
- Dynamically explore collection fields
- View data in table or JSON format
- Apply GST calculations on numeric fields
- Export data in multiple formats (Excel, CSV, JSON, PDF)
- Generate GST-inclusive receipts for individual documents
- Responsive design that works on all devices

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Official Driver)

### Frontend
- React.js
- Material UI (MUI v5)
- React Context for state management
- xlsx, papaparse, jspdf for export functionality

## Setup and Installation

### Prerequisites
- Node.js v14+ and npm
- MongoDB instance (local or remote)

### Project Structure

```tree
mongodb-data-explorer/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── collectionController.js
│   │   └── queryController.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── routes/
│   │   ├── collectionRoutes.js
│   │   └── queryRoutes.js
│   ├── services/
│   │   └── mongoService.js
│   ├── utils/
│   │   ├── exportUtils.js
│   │   └── gstCalculator.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── LoadingIndicator.jsx
│   │   │   │   └── ToastNotification.jsx
│   │   │   ├── collection/
│   │   │   │   ├── CollectionSelector.jsx
│   │   │   │   └── FieldSelector.jsx
│   │   │   ├── results/
│   │   │   │   ├── ResultsTable.jsx
│   │   │   │   ├── JsonViewer.jsx
│   │   │   │   └── ViewToggle.jsx
│   │   │   ├── gst/
│   │   │   │   ├── GstCalculator.jsx
│   │   │   │   └── GstConfig.jsx
│   │   │   └── export/
│   │   │       ├── ExportOptions.jsx
│   │   │       └── ReceiptGenerator.jsx
│   │   ├── contexts/
│   │   │   └── AppContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── storage.js
│   │   ├── utils/
│   │   │   ├── exportHelpers.js
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── theme.js
│   ├── package.json
│   └── .env
├── README.md
└── docker-compose.yml
```

### Backend Setup
1. Navigate to the backend directory:
   cd backend


2. Install dependencies:
   npm install


3. Create a `.env` file based on `.env.example`:
   PORT=5000 MONGODB_URI=mongodb://localhost:27017/yourdbname RATE_LIMIT_WINDOW_MS=60000 RATE_LIMIT_MAX_REQUESTS=100


4. Start the server:
   npm start


### Frontend Setup
1. Navigate to the frontend directory:
   cd frontend


2. Install dependencies:
   npm install


3. Create a `.env` file:
   REACT_APP_API_URL=http://localhost:5000/api


4. Start the development server:
   npm start


5. Build for production:
   npm run build


### Docker Setup (Optional)
1. Make sure Docker and Docker Compose are installed
2. Run:
   docker-compose up -d


## API Endpoints

- `GET /api/collections`: Get all available collections
- `GET /api/fields?collection={collectionName}`: Get fields from a collection
- `POST /api/query`: Execute query with optional GST calculation
- `POST /api/export`: Export data in specified format
- `POST /api/receipt/{collection}/{documentId}`: Generate receipt for a document

## GST Calculation

GST is calculated using the formula:
GST Amount = Field Value × GST Percentage / 100 Total Amount = Field Value + GST Amount


The application allows users to:
1. Enable/disable GST calculation
2. Select which field to apply GST on
3. Choose GST percentage (5%, 12%, 18%, 28%)
4. View calculated GST and total amounts in results
5. Include GST calculations in exports and receipts

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.