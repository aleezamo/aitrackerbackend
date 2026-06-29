# aitrackerbackend
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](https://opensource.org/licenses/AGPL-3.0)


aitrackerbackend is a full-stack, containerized analytics system for collecting, storing and visualizing AI-driven traffic. It tracks when users land on a website via AI-generated links and provides a dashboard to analyze that traffic.

> **Live hosted version now available at [aitraffic.app](https://aitraffic.app)** — get your tracking snippet in seconds. The platform is free to use during the early access phase. I've used the Amazon AWS EC2 to deploy these services.

## Overview
This project captures tracking events when a user visits a website through an AI-generated response link (e.g., ChatGPT, AI search tools, etc.).
The system is a complete multi-service architecture:

**FastAPI** (Python) — ingestion API for collecting tracking events

**PostgreSQL** — persistent storage for all event and user data

**Node.js / Express** — server‑side rendered dashboard with EJS templates

**Caddy** — reverse proxy with automatic HTTPS via Let's Encrypt

**Docker Compose** — orchestrates all services with a single command

Together, these services provide a full pipeline from **data collection → storage → analytics visualization**.

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
- Automatic HTTPS via Caddy
- Designed to be self-hosted

## How to Run 
- `git clone https://github.com/aleezamo/aitrackerbackend`
- `cd aitrackerbackend`
- `cp .env.example .env` and fill in your own values.
- `edit Caddyfile to use your own domain.
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

## Tech Stack
**Ingestion API**	Python, FastAPI, SQLAlchemy, Pydantic

**Dashboard**	Node.js, Express, EJS, Charts.js

**Database** PostgreSQL 16

**Reverse Proxy / SSL**	Caddy (automatic Let's Encrypt)

**Containerization** Docker, Docker Compose

**Tracker Script** Vanilla JavaScript, served via jsDelivr CDN

## Future Improvements
- Advanced filtering and analytics
- UI improvements

## Usage
Run the backend server and connect it to the aitracker script’s tracking endpoint.

## Open Usage
Feel free to use, modify, and include this project in your own self-hosted setting.

Built with ❤️ by [Aleeza Mohsin](https://www.linkedin.com/in/aleezamohsin)
