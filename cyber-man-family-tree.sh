#!/bin/bash
echo "Preparing Family Tree..."
PROJECT_PATH="/home/ubuntu/services/family-tree"
echo "Creating $PROJECT_PATH"
mkdir -p $PROJECT_PATH
echo "console.log('init Family Tree');" > $PROJECT_PATH/server.js
pm2 start $PROJECT_PATH/server.js --name "Family Tree"
