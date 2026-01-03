#!/bin/bash
# Debug script for production VPS

echo "=== Checking Nginx Error Logs ==="
docker logs supplyzone-nginx --tail 50

echo -e "\n=== Checking Frontend Container Logs ==="
docker logs supplyzone-frontend --tail 30

echo -e "\n=== Checking Nginx Configuration Syntax ==="
docker exec supplyzone-nginx nginx -t

echo -e "\n=== Checking Container Status ==="
docker ps --filter "name=supplyzone" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "\n=== Testing Frontend Connectivity from Nginx ==="
docker exec supplyzone-nginx wget -O- http://frontend:80 --timeout=5 2>&1 | head -20

echo -e "\n=== Checking Frontend Nginx Config ==="
docker exec supplyzone-frontend cat /etc/nginx/conf.d/default.conf
