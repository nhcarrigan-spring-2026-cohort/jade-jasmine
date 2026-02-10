#!/bin/bash

# User endpoint tests
# Tests: signup, login

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/test-lib.sh"

# Test user credentials
TEST_USERNAME="testuser_$(date +%s)"
TEST_EMAIL="test_${TEST_USERNAME}@example.com"
TEST_PASSWORD="testpassword123"

echo ""
echo "========================================"
echo " User Endpoint Tests"
echo "========================================"
echo ""
echo "Testing with username: $TEST_USERNAME"
echo "Testing with email: $TEST_EMAIL"
echo ""

# ============================================
# Test 1: User Signup
# ============================================
print_header "Test 1: User Signup"

# Payload for signup - note: uses new-password and confirm-password
SIGNUP_DATA=$(cat <<EOF
{
  "username": "${TEST_USERNAME}",
  "email": "${TEST_EMAIL}",
  "new-password": "${TEST_PASSWORD}",
  "confirm-password": "${TEST_PASSWORD}"
}
EOF
)

echo "Request body: $SIGNUP_DATA"
echo ""

RESPONSE=$(api_post "/user/signup" "$SIGNUP_DATA")
assert_status "$RESPONSE" "201" "Signup should return 201 Created"

# ============================================
# Test 2: User Login
# ============================================
print_header "Test 2: User Login"

# Payload for login - note: uses username and password (not email)
LOGIN_DATA=$(cat <<EOF
{
  "username": "${TEST_USERNAME}",
  "password": "${TEST_PASSWORD}"
}
EOF
)

echo "Request body: $LOGIN_DATA"
echo ""

RESPONSE=$(api_post "/user/login" "$LOGIN_DATA")
assert_status "$RESPONSE" "204" "Login should return 204 No Content"

# Extract JWT token from Authorization header
# The response should have an Authorization header with Bearer token
if command -v jq &> /dev/null; then
    # Get the response headers to extract the token
    HEADER_RESPONSE=$(curl -s -i -X POST \
        -H "Content-Type: application/json" \
        -d "$LOGIN_DATA" \
        "${API_PREFIX}/user/login")

    # Extract Authorization header
    JWT_TOKEN=$(echo "$HEADER_RESPONSE" | grep -i "Authorization:" | sed 's/Authorization: Bearer //i' | tr -d '\r\n')

    if [ -n "$JWT_TOKEN" ]; then
        echo -e "${GREEN}✓ Token obtained successfully${NC}"
        echo "Token: ${JWT_TOKEN:0:50}..."
    else
        echo -e "${YELLOW}⚠ Could not extract token from response${NC}"
        echo "Full headers response:"
        echo "$HEADER_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠ jq not installed, cannot extract token programmatically${NC}"
fi

# ============================================
# Test 3: Signup with missing fields
# ============================================
print_header "Test 3: Signup with Missing Fields"

BAD_SIGNUP_DATA='{"username": "incomplete"}'
RESPONSE=$(api_post "/user/signup" "$BAD_SIGNUP_DATA")
assert_status "$RESPONSE" "400" "Signup with missing fields should return 400"

# ============================================
# Test 4: Login with wrong password
# ============================================
print_header "Test 4: Login with Wrong Password"

WRONG_LOGIN_DATA=$(cat <<EOF
{
  "username": "${TEST_USERNAME}",
  "password": "wrongpassword"
}
EOF
)

RESPONSE=$(api_post "/user/login" "$WRONG_LOGIN_DATA")
assert_status "$RESPONSE" "401" "Login with wrong password should return 401"

# ============================================
# Test 5: Login with non-existent user
# ============================================
print_header "Test 5: Login with Non-existent User"

NONEXISTENT_LOGIN_DATA=$(cat <<EOF
{
  "username": "nonexistent_user_xyz",
  "password": "somepassword"
}
EOF
)

RESPONSE=$(api_post "/user/login" "$NONEXISTENT_LOGIN_DATA")
assert_status "$RESPONSE" "401" "Login with non-existent user should return 401"

# ============================================
# Test Summary
# ============================================
echo ""
print_summary
