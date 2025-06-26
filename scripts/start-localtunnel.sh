#!/bin/bash
# Quick persistent tunnel with localtunnel

# Install localtunnel
npm install -g localtunnel

# Start with consistent subdomain
# This gives you: https://alfred-n8n.loca.lt
lt --port 5678 --subdomain alfred-n8n

# Add to your .bashrc for easy access:
# alias n8n-tunnel='lt --port 5678 --subdomain alfred-n8n'