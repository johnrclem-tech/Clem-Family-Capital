# Plaid Sandbox Test Credentials

## ⚠️ Important: Sandbox Mode Only

When testing with Plaid's sandbox environment, you **cannot** use real credentials. You must use these test values:

## Test Credentials

### Bank Login
- **Username**: `user_good`
- **Password**: `pass_good`

### Phone Number (if required)
Use one of these test numbers:
- `415-555-1234`
- `+14155551234`
- `555-123-4567`
- `415-555-0000`

**❌ Real phone numbers will FAIL in sandbox mode**

### Email (if required)
- `test@example.com`
- `user@test.com`
- Any test email address

### MFA/2FA Code (if required)
- `1234`
- `0000`
- Any 4-digit code

## Common Issues

### Phone Number Fails
**Problem**: Your real phone number doesn't work  
**Solution**: Use test numbers like `415-555-1234` - real numbers are blocked in sandbox

### Authentication Fails
**Problem**: Login credentials rejected  
**Solution**: Make sure you're using `user_good` / `pass_good` (not your real bank credentials)

### MFA Required
**Problem**: Bank asks for multi-factor authentication  
**Solution**: Enter `1234` or any test code - MFA is simulated in sandbox

## Testing Different Scenarios

### Successful Connection
- Username: `user_good`
- Password: `pass_good`
- Phone: `415-555-1234`

### Error Scenarios (for testing)
- Username: `user_bad` → Will show error
- Password: `pass_bad` → Will show error

## Production vs Sandbox

| Feature | Sandbox | Production |
|---------|---------|------------|
| Phone Numbers | Test only (`415-555-1234`) | Real numbers |
| Bank Credentials | Test (`user_good`/`pass_good`) | Real credentials |
| Transactions | Simulated test data | Real transactions |
| MFA Codes | Any code works (`1234`) | Real codes required |

## Quick Reference

When connecting an account in sandbox mode:
1. ✅ Use `user_good` / `pass_good`
2. ✅ Use `415-555-1234` for phone
3. ✅ Use `1234` for MFA codes
4. ❌ Don't use your real phone number
5. ❌ Don't use your real bank credentials

## Need More Test Credentials?

Check Plaid's official documentation:
- [Plaid Sandbox Testing Guide](https://plaid.com/docs/sandbox/test-credentials/)
- [Plaid Link Testing](https://plaid.com/docs/link/testing/)
