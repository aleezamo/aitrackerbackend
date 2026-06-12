# aitrackerbackend

aitrackerbackend is a full-stack, containerized analytics system for collecting, storing and visualizing AI-driven traffic. It tracks when users land on a website via AI-generated links and provides a dashboard to analyze that traffic.

## Overview
This project captures tracking events when a user visits a website through an AI-generated response link (e.g., ChatGPT, AI search tools, etc.).

The system is now a complete multi-service architecture consisting of:
- A FastAPI backend (API) for collecting tracking events
- A PostgreSQL database for storing event data
- A NodeJS Dashboard frontend for visualizing traffic analytics
- An Nginx reverse proxy for routing requests between services
  
Together, these services provide a full pipeline from data collection -> storage -> analytics visualization.

## Features
- REST API endpoint for tracking events
- Stores data such as:
  - host name
  - AI source
  - path visited
  - timestamp
- Dashboard for analytics visualization
- Authentication for dashboard
- Multi-site tracking
- Fully containerized with Docker Compose
- Nginx-based routing
- Designed to be self-hosted

## How to Run 
- `git clone https://github.com/aleezamo/aitrackerbackend`
- `cd aitrackerbackend`
- `cp .env.example .env` and fill in your own values.
- `docker compose up -d --build` 

## API
### Track Event
POST /track
`
{
  "hostName": "example.com",
  "aiSource": "chatgpt",
  "pathName": "/blog/post-1",
  "pageTitle": "Post1"
}`

## Dashboard
The dashboard provides visual analytics for AI-driven traffic, including:

- Event counts
- Hourly/Weekly/Monthly trends
- AI source breakdown
  
Accessible via the Nginx entry point (port 80).

## Current Status
- Backend API fully functional
- Dashboard integrated
- PostgreSQL storage active
- Docker Compose setup for full system
- Nginx routing configured
  

## Future Improvements
- Advanced filtering and analytics
- UI improvements

## Usage
Run the backend server and connect it to the aitracker script’s tracking endpoint.

## Open Usage
Feel free to use, modify, and include this project in your own self-hosted setting.
