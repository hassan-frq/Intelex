# Frontend

This directory contains the frontend application for the AI-Powered Legal Assistant project.

## Tech Stack

- React
- Vite
- React Router DOM
- Axios
- JavaScript (ES6+)
- CSS

## Dependencies

| Package | Purpose |
|----------|---------|
| react | UI Library |
| react-dom | React DOM Rendering |
| react-router-dom | Client-side routing |
| axios | HTTP client for API communication |
| vite | Development server and build tool |

## Installation

```bash
npm install
```
## Run Development Server

```bash
npm run dev
```
## Build for Production

```bash
npm run build
```
## Project Structure

```text
src/
├── assets/
├── components/
├── context/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── styles/
├── utils/
├── App.jsx
└── main.jsx
```
## Notes

- All frontend development should follow the established folder structure.
- API communication should be handled through the `services/` directory.
- Reusable UI components should be placed in the `components/` directory.
- New features should be developed on separate Git branches before being merged.
