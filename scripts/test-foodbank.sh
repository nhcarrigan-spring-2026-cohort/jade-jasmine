#!/bin/bash

# Food Bank endpoint tests
# Tests: get foodbank list, get foodbank details (if auth available)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/test-lib.sh"

echo ""
echo "========================================"
echo " Food Bank Endpoint Tests"
echo "========================================"
echo ""

# ============================================
# Test 1: Get Food Bank List (No Auth)
# ============================================
print_header "Test 1: Get Food Bank List (Public Endpoint)"

echo "Testing GET /v1/foodbank"
echo ""

RESPONSE=$(api_get "/foodbank")
assert_status "$RESPONSE" "200" "Get foodbank list should return 200 OK"

# ============================================
# Test 2: Get Food Bank List with Query Params
# ============================================
print_header "Test 2: Get Food Bank List with Query Parameters"

echo "Testing GET /v1/foodbank?name=test"
echo ""

RESPONSE=$(api_get "/foodbank?name=test")
assert_status "$RESPONSE" "200" "Get foodbank with name filter should return 200"

# ============================================
# Test 3: Get Food Bank List with City Filter
# ============================================
print_header "Test 3: Get Food Bank List with City Filter"

echo "Testing GET /v1/foodbank?city=toronto"
echo ""

RESPONSE=$(api_get "/foodbank?city=toronto")
assert_status "$RESPONSE" "200" "Get foodbank with city filter should return 200"

# ============================================
# Test 4: Get Food Bank List with Pagination
# ============================================
print_header "Test 4: Get Food Bank List with Pagination"

echo "Testing GET /v1/foodbank?limit=10&offset=0"
echo ""

RESPONSE=$(api_get "/foodbank?limit=10&offset=0")
assert_status "$RESPONSE" "200" "Get foodbank with pagination should return 200"

# ============================================
# Test 5: Get Specific Food Bank by ID
# ============================================
print_header "Test 5: Get Specific Food Bank by ID"

echo "Testing GET /v1/foodbank/1"
echo ""

RESPONSE=$(api_get "/foodbank/1")
assert_status "$RESPONSE" "200" "Get foodbank by ID should return 200"

# ============================================
# Test 6: Get Non-existent Food Bank
# ============================================
print_header "Test 6: Get Non-existent Food Bank"

echo "Testing GET /v1/foodbank/99999"
echo ""

RESPONSE=$(api_get "/foodbank/99999")
# Should return 404 or 500 (depending on DB response)
if [ "$(echo "$RESPONSE" | tail -n1)" = "404" ] || [ "$(echo "$RESPONSE" | tail -n1)" = "500" ]; then
    print_result "Get non-existent foodbank should return 404 or 500" 0 "404/500" "$(echo "$RESPONSE" | tail -n1)"
    ((TESTS_RUN++))
    ((TESTS_PASSED++))
else
    print_result "Get non-existent foodbank should return 404 or 500" 1 "404/500" "$(echo "$RESPONSE" | tail -n1)"
    ((TESTS_RUN++))
    ((TESTS_FAILED++))
fi

# ============================================
# Test 7: Get Food Bank List - Invalid Params
# ============================================
print_header "Test 7: Get Food Bank List with Invalid Limit"

echo "Testing GET /v1/foodbank?limit=invalid"
echo ""

RESPONSE=$(api_get "/foodbank?limit=invalid")
assert_status "$RESPONSE" "400" "Get foodbank with invalid limit should return 400"

# ============================================
# Test Summary
# ============================================
echo ""
print_summary
