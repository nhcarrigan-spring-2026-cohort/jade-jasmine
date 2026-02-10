#!/bin/bash

# Parent test script - runs all or specific test scripts
# Usage: ./run-tests.sh [--user] [--foodbank] [--all] [--help]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Default: run all tests
RUN_USER=false
RUN_FOODBANK=false
RUN_ALL=true

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --user)
            RUN_USER=true
            RUN_ALL=false
            shift
            ;;
        --foodbank)
            RUN_FOODBANK=true
            RUN_ALL=false
            shift
            ;;
        --all)
            RUN_ALL=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --user      Run user endpoint tests (signup, login)"
            echo "  --foodbank  Run foodbank endpoint tests"
            echo "  --all       Run all tests (default)"
            echo "  --help      Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  API_BASE_URL    Base URL for the API (default: http://localhost:3003)"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo ""
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     API Test Runner                   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
echo ""

# Source configuration to get BASE_URL
source "${SCRIPT_DIR}/test-config.sh"
echo -e "API Base URL: ${GREEN}${BASE_URL}${NC}"
echo -e "API Prefix:   ${GREEN}${API_PREFIX}${NC}"
echo ""

# Check if API is running
echo "Checking if API is available at ${BASE_URL}..."
if curl -s --connect-timeout 5 "${BASE_URL}" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API is reachable${NC}"
else
    echo -e "${RED}✗ Cannot reach API at ${BASE_URL}${NC}"
    echo "Make sure the API server is running before executing tests."
    echo "You can start it with: cd apps/api-server && npm start"
    exit 1
fi

echo ""

# Track overall test results
OVERALL_PASSED=0
OVERALL_FAILED=0

# Run user tests
if [ "$RUN_USER" = true ] || [ "$RUN_ALL" = true ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW} Running User Endpoint Tests${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    bash "${SCRIPT_DIR}/test-user.sh"
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
        ((OVERALL_PASSED++))
    else
        ((OVERALL_FAILED++))
    fi
    echo ""
fi

# Run foodbank tests
if [ "$RUN_FOODBANK" = true ] || [ "$RUN_ALL" = true ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW} Running Food Bank Endpoint Tests${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    bash "${SCRIPT_DIR}/test-foodbank.sh"
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
        ((OVERALL_PASSED++))
    else
        ((OVERALL_FAILED++))
    fi
    echo ""
fi

# Final summary
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     Final Test Summary                 ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e " User Tests:    $([ "$RUN_USER" = true ] || [ "$RUN_ALL" = true ] && echo -e "${GREEN}✓${NC}" || echo "○")"
echo -e " Foodbank Tests: $([ "$RUN_FOODBANK" = true ] || [ "$RUN_ALL" = true ] && echo -e "${GREEN}✓${NC}" || echo "○")"
echo ""
echo -e " ${GREEN}Passed test suites: ${OVERALL_PASSED}${NC}"
echo -e " ${RED}Failed test suites: ${OVERALL_FAILED}${NC}"
echo ""

if [ $OVERALL_FAILED -eq 0 ]; then
    echo -e "${GREEN}All test suites passed!${NC}"
    exit 0
else
    echo -e "${RED}Some test suites failed!${NC}"
    exit 1
fi
