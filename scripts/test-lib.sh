#!/bin/bash

# Common library functions for API tests
# Source this file in your test scripts

# Source configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/test-config.sh"

# Print test header
print_header() {
    echo ""
    echo "========================================"
    echo " $1"
    echo "========================================"
}

# Print test result
print_result() {
    local test_name="$1"
    local status="$2"
    local expected="$3"
    local actual="$4"
    local message="${5:-}"

    ((TESTS_RUN++))

    if [ "$status" -eq 0 ]; then
        ((TESTS_PASSED++))
        echo -e "${GREEN}✓ PASS${NC}: $test_name"
    else
        ((TESTS_FAILED++))
        echo -e "${RED}✗ FAIL${NC}: $test_name"
        if [ -n "$expected" ]; then
            echo "  Expected: $expected"
        fi
        if [ -n "$actual" ]; then
            echo "  Actual: $actual"
        fi
        if [ -n "$message" ]; then
            echo "  Message: $message"
        fi
    fi
}

# Make GET request
api_get() {
    local endpoint="$1"
    local headers="${2:-}"
    curl -s -w "\n%{http_code}" "${API_PREFIX}${endpoint}" $headers
}

# Make POST request
api_post() {
    local endpoint="$1"
    local data="$2"
    local headers="${3:--H "Content-Type: application/json"}"
    curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        $headers \
        -d "$data" \
        "${API_PREFIX}${endpoint}"
}

# Make POST request with auth
api_post_auth() {
    local endpoint="$1"
    local data="$2"
    local headers="${3:-}"
    curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${JWT_TOKEN}" \
        $headers \
        -d "$data" \
        "${API_PREFIX}${endpoint}"
}

# Make GET request with auth
api_get_auth() {
    local endpoint="$1"
    local headers="${2:-}"
    curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer ${JWT_TOKEN}" \
        $headers \
        "${API_PREFIX}${endpoint}"
}

# Assert HTTP status code
assert_status() {
    local response="$1"
    local expected_status="$2"
    local test_name="$3"

    # Extract status code (last line of response)
    local actual_status
    actual_status=$(echo "$response" | tail -n1)
    # Extract body (all but last line)
    local body
    body=$(echo "$response" | sed '$d')

    if [ "$actual_status" = "$expected_status" ]; then
        print_result "$test_name" 0 "$expected_status" "$actual_status"
        # Output body for debugging
        echo "  Response body: $body"
        return 0
    else
        print_result "$test_name" 1 "$expected_status" "$actual_status" "Status code mismatch"
        echo "  Response body: $body"
        return 1
    fi
}

# Assert JSON field value
assert_json_field() {
    local response="$1"
    local field="$2"
    local expected_value="$3"
    local test_name="$4"

    # Extract body (all but last line)
    local body
    body=$(echo "$response" | sed '$d')

    # Extract field value using jq (if available)
    if command -v jq &> /dev/null; then
        local actual_value
        actual_value=$(echo "$body" | jq -r ".$field // empty" 2>/dev/null)

        if [ "$actual_value" = "$expected_value" ]; then
            print_result "$test_name" 0 "$expected_value" "$actual_value"
            return 0
        else
            print_result "$test_name" 1 "$expected_value" "$actual_value" "JSON field mismatch"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠ SKIP${NC}: jq not installed, cannot parse JSON"
        return 2
    fi
}

# Assert response contains string
assert_contains() {
    local response="$1"
    local expected_string="$2"
    local test_name="$3"

    # Extract body (all but last line)
    local body
    body=$(echo "$response" | sed '$d')

    if echo "$body" | grep -q "$expected_string"; then
        print_result "$test_name" 0 "contains '$expected_string'" "contains '$expected_string'"
        return 0
    else
        print_result "$test_name" 1 "contains '$expected_string'" "does not contain"
        return 1
    fi
}

# Print test summary
print_summary() {
    echo ""
    echo "========================================"
    echo " Test Summary"
    echo "========================================"
    echo -e " Total: ${TESTS_RUN}"
    echo -e " ${GREEN}Passed: ${TESTS_PASSED}${NC}"
    echo -e " ${RED}Failed: ${TESTS_FAILED}${NC}"
    echo "========================================"

    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}All tests passed!${NC}"
        return 0
    else
        echo -e "${RED}Some tests failed!${NC}"
        return 1
    fi
}
