#!/bin/bash

# Configuration for API tests

# Base URL for the API
BASE_URL="${API_BASE_URL:-http://localhost:3003}"

# API Version prefix
API_PREFIX="${BASE_URL}/v1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# JWT Token (set after login)
JWT_TOKEN=""
