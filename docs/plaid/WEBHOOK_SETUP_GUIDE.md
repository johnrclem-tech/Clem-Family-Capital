# Quick Setup Guide: Plaid Webhooks

## ⚡ 5-Minute Setup

### Step 1: Get Webhook Secret

1. Go to: https://dashboard.plaid.com/developers/webhooks
2. Click **"Create Webhook"** or select existing webhook
3. Copy the **Webhook Secret** (starts with `whsec_`)

### Step 2: Add to .env.local

Open `.env.local` and add:

```bash
PLAID_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

### Step 3: Set Webhook URL

#### For Local Testing (with ngrok):

1. Install ngrok:
   ```bash
   brew install ngrok
   ```

2. Start your dev server:
   ```bash
   npm run dev
   ```

3. In another terminal, start ngrok:
   ```bash
   ngrok http 3000
   ```

4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)

5. In Plaid Dashboard, set webhook URL to:
   ```
   https://abc123.ngrok.io/api/webhooks/plaid
   ```

#### For Production:

Set webhook URL to:
```
https://your-domain.com/api/webhooks/plaid
```

### Step 4: Restart Server

```bash
# Stop dev server (Ctrl+C)
npm run dev
```

### Step 5: Test It

1. Connect a test account in your app
2. Go to Plaid Dashboard → Webhooks
3. Click "Send Test Webhook"
4. Select `SYNC_UPDATES_AVAILABLE`
5. Check your terminal - you should see:
   ```
   ✓ Received Plaid webhook: SYNC_UPDATES_AVAILABLE
   ✓ Syncing item abc123...
   ```

## That's It! 🎉

Your app now automatically syncs when Plaid detects new transactions. No manual sync needed!

## Troubleshooting

### "Invalid signature" error
- Check `PLAID_WEBHOOK_SECRET` is correct
- Restart server after adding secret
- Verify no extra spaces in `.env.local`

### Webhook not arriving
- Ensure ngrok is running
- Check webhook URL in Plaid Dashboard
- Verify server is running on port 3000

### Still need help?
See full documentation in `WEBHOOK_IMPLEMENTATION.md`
