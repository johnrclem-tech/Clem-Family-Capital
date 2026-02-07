# Plaid Setup Instructions

## 1. Get Your Plaid Credentials

### Create a Plaid Account
1. Go to [plaid.com](https://plaid.com) and sign up for a free account
2. Complete the onboarding process
3. Navigate to **Team Settings** > **Keys** in your dashboard

### Get Your Credentials
You'll need:
- **Client ID** - A unique identifier for your application
- **Sandbox Secret** - Used for development and testing

**Important:** Use the **Sandbox** secret for development, not the Development or Production secrets.

## 2. Configure Environment Variables

Create or edit your `.env.local` file in the root of your project:

```env
# Plaid Configuration
PLAID_CLIENT_ID=your-plaid-client-id-here
PLAID_SECRET=your-plaid-sandbox-secret-here
PLAID_ENV=sandbox

# Supabase Configuration (also needed)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Replace the placeholder values with your actual credentials:**

- `PLAID_CLIENT_ID`: Copy from Plaid Dashboard > Team Settings > Keys
- `PLAID_SECRET`: Copy the **Sandbox** secret from Plaid Dashboard

## 3. How It Works

### The "Connect Account" Button
- **Click**: Creates a secure link token from your server
- **Plaid Link Opens**: Securely connects to your bank
- **Test Credentials**: Use these sandbox credentials:
  - Username: `user_good`
  - Password: `pass_good`
  - Phone Number: `415-555-1234` (or any test number - real numbers won't work in sandbox)
  - Email: Any test email like `test@example.com`
- **Success**: Account is connected and transactions begin syncing

**Important**: In sandbox mode, you MUST use test credentials. Real phone numbers, emails, or bank credentials will fail.

### Account Credentials vs API Credentials

**Plaid API Credentials** (what you just configured):
- Stored in `.env.local`
- Used to authenticate your app with Plaid's servers
- Never shared with users
- Same for all users of your application

**Bank Account Credentials** (provided by users):
- Entered directly in Plaid Link popup
- Never stored in your database
- Used only during the connection process
- Each user provides their own bank login

## 4. Testing the Connection

1. Start your development server: `npm run dev`
2. Open http://localhost:3000
3. Click "Connect Account"
4. In Plaid Link, search for any bank (e.g., "Chase", "Wells Fargo")
5. Use test credentials:
   - **Username**: `user_good`
   - **Password**: `pass_good`
   - **Phone Number** (if prompted): `415-555-1234` or `+14155551234`
   - **Email** (if prompted): `test@example.com`
   - **MFA Code** (if prompted): `1234` or any 4-digit code
6. Complete the connection
7. Click "Sync Transactions" to fetch data

**⚠️ Sandbox Mode Restrictions:**
- Real phone numbers will **fail** - you must use test numbers like `415-555-1234`
- Real email addresses may work, but test emails are recommended
- Some banks may require MFA - use `1234` as the code
- If phone verification fails, try different test numbers: `415-555-0000`, `555-123-4567`, etc.

## 5. Multiple Accounts

Each time you click "Connect Account", you can add a different bank account. The app will:
- Store each connection separately
- Sync transactions from all connected accounts
- Show transactions from all accounts in one unified view

## 6. Production Setup

When ready for production:

1. Go to Plaid Dashboard > Team Settings > Keys
2. Get your **Production** secret (not sandbox)
3. Update `.env.local`:
   ```env
   PLAID_ENV=production
   PLAID_SECRET=your-production-secret-here
   ```
4. Deploy your application

## Troubleshooting

### "Invalid Plaid credentials"
- Double-check your Client ID and Secret in `.env.local`
- Make sure you're using the Sandbox secret (not Development/Production)
- Restart your development server after changing `.env.local`

### Plaid Link doesn't open
- Check browser console for errors
- Make sure `.env.local` has valid Plaid credentials
- Try refreshing the page

### Phone number verification fails
- **You're in sandbox mode** - real phone numbers don't work
- Use test phone numbers: `415-555-1234`, `555-123-4567`, or `+14155551234`
- Some institutions may skip phone verification - try different banks
- If MFA is required, use code `1234`

### Sync fails
- Check that you have a Supabase database set up
- Run the schema from `supabase/schema.sql`
- Check `.env.local` has valid Supabase credentials

### Need Help?
- Check the [Plaid Documentation](https://plaid.com/docs/)
- Review the [Setup Guide](./SETUP_GUIDE.md)
- Check browser developer tools for error messages</contents>
</xai:function_call/><xai:function_call name="Shell">
<parameter name="command">npm run build