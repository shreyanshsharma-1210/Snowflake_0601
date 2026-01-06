# Immediate Testing Instructions - White Screen Debug

## Quick Start

1. **Start the app:** `npm run dev`
2. **Open the Chatbot page**
3. **Open DevTools:** Press `F12`
4. **Go to Console tab** - keep it open during testing

## Test Voice Chat

1. Click the **microphone button** (🎤)
2. Speak clearly: **"Hello, how are you?"**
3. **DON'T close DevTools** - watch the logs
4. Wait for audio to respond

## What to Observe

### In the Chat UI (Bottom Panel)
You should see "Recent Logs:" with entries like:
```
🔍 RAW Vapi message: {type: "transcript", ...}
📊 Vapi message received - Type: object
📋 Message structure: type,transcript,role,transcriptType
🤖 AI response: I'm doing well, thank you for asking!
✅ Message added to state, total: 2
```

### In Browser Console
Watch for logs like:
```
🔍 RAW Vapi message: Object { ... }
🔍 Message type: object
🔍 Message keys: ['type', 'transcript', 'role', 'transcriptType']
Message object: { id: "...", content: "...", sender: "ai", ... }
```

## If White Screen Still Appears

**Immediately check:**

1. **Browser Console (F12 → Console tab)**
   - Copy any red error messages
   - Look for "Error" or "Cannot"

2. **Chat Debug Panel**
   - Screenshot the "Recent Logs" section
   - Look for any ❌ errors

3. **Check Network Tab (F12 → Network)**
   - Is there a failed Vapi API call?
   - Status 400, 401, 403, 500?

4. **Share this information:**
   - The exact error message from console
   - The screenshot of debug logs
   - The network error (if any)

## Expected Behavior

✅ **Normal Operation:**
- Microphone button animates when clicked
- No white screen appears
- Chat displays your message
- AI response appears with log entries
- Audio plays without issues
- Debug logs show success messages (✅)

❌ **Problem Indication:**
- White screen appears
- No new messages visible
- Debug logs show ❌ errors
- Console shows JavaScript errors
- Audio plays but UI doesn't update

## Troubleshooting Checklist

- [ ] DevTools open and watching console
- [ ] Microphone permission granted (browser should ask)
- [ ] Vapi API key is valid (check .env variables)
- [ ] Internet connection is stable
- [ ] No errors in console before voice chat
- [ ] CPU usage is normal (not maxed out)
- [ ] Browser is not out of memory

## Critical Logs to Capture

If white screen occurs, capture these from console:

1. **All 🔍 RAW Vapi message logs**
2. **Any ❌ errors that appear**
3. **The full error message text**
4. **Network failures in Network tab**
5. **Screenshot of debug panel**

## How to Share for Debugging

Send:
1. Screenshot of browser console errors
2. Screenshot of chat debug panel (Recent Logs)
3. Screenshot of Network tab failed requests
4. Exact steps to reproduce
5. Browser and OS information

## Performance Notes

Debug logging is now enabled for troubleshooting. If you experience:
- Slow chat response
- High CPU usage
- Memory issues

These are typically from the enhanced logging. The next version can have logging reduced once the white screen is fixed.

## One More Thing

**Always try these steps first if white screen appears:**
1. Close DevTools (F12)
2. Refresh the page (F5)
3. Try voice chat again
4. Then open DevTools to see detailed logs

Sometimes a page refresh clears state issues that were temporary.
