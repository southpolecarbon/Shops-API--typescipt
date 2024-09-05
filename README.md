# Magento Shop APP

This project is a full-stack application for managing a purchase flow using Magento GraphQL API, React, TypeScript, and Vite. It showcases the GraphQL API features for the Magento store. The project includes a backend server built with Express and a frontend client built with React. The accepted payment options during the checkout are debit/credit(online) and bank transfer(offline). The online payments are setup via Stripe. However, the offline method is being handled by magento at the moment(sending invoice etc.). We are planning on handling the offline payments through Stripe as well.

## Project Structure

```
├── backend/
│   ├── .env
│   ├── .env-template
│   ├── package.json
│   └── tsconfig.json
│   └── src/
│       ├── server.ts
├── frontend/
│   ├── .env
│   ├── .env-template
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── public/
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── App.css
│       ├── components/
│       ├── graphql/
│       └── types/
├── .gitattributes
├── .gitignore
├── README.md
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

3. Create `.env` files for both frontend and backend directories according to the `.env-temaple` files and update the values. Please note that if you are implmenting the Stripe Payment Element form, you need to request for a `STRIPE_PUBLIC_KEY` so the online transactions can be processed on our side. You also need your own `STORE_VIEW_CODE` that will be provided to you by South Pole. This code should be included in your graphql requests' headers to scope the operations to your own store.

## Running the Application

1. Start the backend server:

```sh
cd backend
npm run start
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

## Resources

[Adobe Commerce graphql Reference](https://developer.adobe.com/commerce/webapi/graphql/reference/)
[GraphQL headers](https://developer.adobe.com/commerce/webapi/graphql/usage/headers/)
[GraphQL checkout tutorial](https://developer.adobe.com/commerce/webapi/graphql/tutorials/checkout/)
[Stripe Connector for Adobe Commerce](https://docs.stripe.com/connectors/adobe-commerce)
