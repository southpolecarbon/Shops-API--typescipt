# Magento Shop APP

This project is a full-stack application for managing a purchase flow using Magento GraphQL API, React, TypeScript, and Vite. It showcases the GraphQL API features for the Magento store. The project includes a backend server built with Express and a frontend client built with React.

## Project Structure

```
├── backend/
│   ├── .env
│   ├── .env-template
│   ├── .gitignore
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── .env
│   ├── .env-template
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── App.css
│       ├── App.tsx
│       ├── assets/
│       ├── components/
│       ├── graphql/
│       ├── index.css
│       ├── main.tsx
│       └── types/
├── README.md
├── .gitattributes
```

## Getting Started

### Prerequisites

- Node.js

## Installation

1. Clone the repository

```sh
git clone git@github.com:southpolecarbon/Shops-API--typescipt.git
cd Shops-API--typescipt
```

2. Install dependencies for both the backend and frontend:

### Install backend dependencies

```sh
cd backend
npm install
```

### Install frontend dependencies

```sh
cd frontend
npm install
```

3. Create `.env` files for both frontend and backend directories according to the `.env-temaple` files and update the values.

## Running the Application

1. Start the backend server:

```sh
cd backend
npm start
```

The server is configured to be listening on PORT 3000. You can modify it via env variables.

2. Start the frontend development server:

```sh
cd frontend
npm run dev
```

The frontend app is configured to be running on PORT 5000. You can modify it via env variables.

## Access the Application

- Open a browser and go to `http://localhost:3000` to access the app.
