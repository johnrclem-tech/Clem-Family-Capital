# Troubleshooting Guide

## Connection Refused Error (ERR_CONNECTION_REFUSED)

### Problem
You see: `ERR_CONNECTION_REFUSED - Error Code: -102 URL: http://localhost:3000/`

### Solution

#### Step 1: Check if Server is Running
Look at your terminal where you ran `npm run dev`. You should see:
```
▲ Next.js 16.1.4 (Turbopack)
- Local:         http://localhost:3000
- Environments: .env.local

✓ Ready in 2.3s
```

#### Step 2: Start the Server
If the server is not running:

```bash
cd "/Users/johnclem/Documents/Cursor/Quicken App"
npm run dev
```

#### Step 3: Check the Port
The server might be running on a different port. Look for:
- `http://localhost:3000` (default)
- `http://localhost:3001` (if 3000 is in use)
- `http://localhost:3002` (if both are in use)

Check your terminal output to see which port is actually being used.

#### Step 4: Access the Correct URL
- Open the URL shown in your terminal (usually `http://localhost:3000` or `http://localhost:3001`)
- Make sure you're using `http://` not `https://`
- Make sure the port matches what's shown in the terminal

### Common Causes

1. **Server Not Started**
   - Solution: Run `npm run dev` in your project directory

2. **Server Crashed**
   - Solution: Check terminal for errors, restart with `npm run dev`

3. **Port Already in Use**
   - Solution: Use the port shown in terminal (might be 3001, 3002, etc.)
   - Or kill the process using port 3000: `killall node` then restart

4. **Wrong URL**
   - Solution: Use the exact URL shown in your terminal output

### Quick Fix Checklist

- [ ] Is `npm run dev` running in a terminal?
- [ ] Do you see "Ready" message in terminal?
- [ ] Are you using the correct port from terminal?
- [ ] Are you using `http://` not `https://`?
- [ ] Did you try refreshing the browser?

### After Plaid Connection

If Plaid Link opens but then shows connection refused:
- The server might have crashed
- Check terminal for error messages
- Restart the server: `npm run dev`
- Try connecting again
