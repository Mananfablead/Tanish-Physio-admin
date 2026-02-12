# Tanish Physio & Fitness Admin

Admin dashboard for Tanish Physio & Fitness management system. This application provides tools for managing appointments, patient records, therapists, and other administrative tasks for a physiotherapy clinic.

## Features

- Dashboard with analytics and overview
- Patient management
- Appointment scheduling
- Therapist profiles and management
- Session tracking
- Booking management
- Payment processing
- Reports and analytics

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- shadcn/ui
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```sh
   git clone <YOUR_REPOSITORY_URL>
   ```

2. Navigate to the project directory:
   ```sh
   cd Tanish-Physio-admin
   ```

3. Install dependencies:
   ```sh
   npm install
   ```

4. Create a `.env` file in the root directory and add your environment variables (see `.env.example` for reference)

5. Start the development server:
   ```sh
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Project Structure

- `src/api/` - API client and request functions
- `src/components/` - Reusable UI components
- `src/features/` - Redux slices for state management
- `src/pages/` - Page components
- `src/routes/` - Route definitions

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Deployment

This application can be deployed to any static hosting service. The build command generates a static site that can be served from any web server.

For deployment to popular platforms like Vercel, Netlify, or GitHub Pages, follow their respective documentation for React/Vite applications.
