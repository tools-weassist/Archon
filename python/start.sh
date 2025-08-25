#!/bin/bash
# Simple startup script for Railway

# Install dependencies
pip install -r requirements.txt

# Start the server
python -m uvicorn src.server.main:socket_app --host 0.0.0.0 --port $PORT