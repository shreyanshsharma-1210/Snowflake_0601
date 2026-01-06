# Voice Chat White Screen - Debugging Guide

## What Changed

Added comprehensive logging and defensive programming to the chatbot message handler to identify exactly what's causing the white screen during voice calls.

### Key Improvements

1. **Enhanced Message Handler Logging**
   - Logs raw Vapi messages to console
   - Tracks message type, structure, and content
   - Validates message objects before processing
   - Reports all message types (transcript, function-call, hang-up, etc.)

2. **Message Rendering Protection**
   - Validates messages before rendering
   - Catches and logs rendering errors
   - Returns null for invalid messages instead of crashing
   - Shows empty state message if no messages exist

3. **Debug Logs Visible in UI**
   - Enabled debug logs panel at bottom of chat
   - Shows last 10 debug log entries
   - Updated in real-time during voice calls
   - Helps identify exactly where issues occur

4. **Error Handling**
   - State updates wrapped in error handling
   - Console logs for all critical operations
   - Error boundary still catches React errors

## How to Debug the White Screen

### Step 1: Open Browser DevTools
- Press `F12` or right-click → "Inspect"
- Go to **Console** tab
- Keep it visible during voice chat

### Step 2: Check Debug Logs in Chat UI
- Look at the bottom of the chat panel
- "Recent Logs:" section shows what the code is doing
- Watch for error messages (❌) or warnings (⚠️)

### Step 3: Monitor Console Output
Look for logs with these prefixes:
- 🔍 `RAW Vapi message:` - The actual data Vapi is sending
- 📊 `Vapi message received` - Message type detection
- 📋 `Message structure:` - What fields are in the message
- 📝 `Transcript received` - Details about the transcript
- 🤖 `AI response:` - The AI's reply text
- 📤 `Adding message to state` - Before state update
- ✅ `Message added to state` - After successful state update
- ❌ `Error` - Any errors that occurred

### Step 4: Identify the Problem
Based on the logs, the issue could be:

**A) Unexpected Message Format**
- Look for `Message structure:` log
- Check what fields are actually in the message
- Compare to expected format

**B) Empty or Invalid Transcript**
- Look for `⚠️ AI response is empty, skipping` log
- Vapi is sending empty transcript

**C) State Update Error**
- Look for `❌ Error updating messages state:` log
- Something is wrong with how message is structured

**D) Rendering Error**
- Look for `Error rendering message:` in console
- Message object has invalid fields

**E) White Screen Before Any Logs**
- Check if Vapi is even sending messages
- Might be Vapi SDK initialization issue

## Message Format Expected

The code now handles:

```javascript
// Transcript message (most common)
{
  type: "transcript",
  transcript: "Hello, how are you?",
  transcriptType: "final",  // or "partial"
  role: "assistant"  // or "user"
}

// Function call
{
  type: "function-call",
  functionName: "some_function"
}

// Hang up
{
  type: "hang-up"
}
```

## What to Report

If the white screen persists, check:

1. **Console logs** - Copy the 🔍 RAW Vapi message logs
2. **Debug panel** - Take screenshot of "Recent Logs"
3. **Network tab** - Check if Vapi API calls are succeeding
4. **Error messages** - Any ❌ errors in the logs

## Testing Steps

1. Open browser DevTools (F12)
2. Go to Chat page
3. Click the microphone button
4. Speak clearly: "How are you?"
5. Wait for response
6. Check logs immediately

### Expected Log Sequence

```
📊 Vapi message received
📋 Message structure: [...fields...]
📝 Transcript received - Role: user
✅ Final user transcript: How are you?
📊 Vapi message received
📋 Message structure: [...fields...]
📝 Transcript received - Role: assistant
🤖 AI response: I'm doing well, thank you for asking!
📤 Adding message to state: ID=...
✅ Message added to state, total: 2
```

## Performance Note

Debug logs are now always visible. If this causes performance issues during longer conversations, they can be hidden by commenting out the debug logs section again.

## Files Modified

- `client/pages/Chatbot.tsx` - Enhanced message handler with detailed logging
- Debug logs panel now visible in chat UI

## Next Steps if Issue Persists

1. Capture the exact message format from 🔍 RAW Vapi message logs
2. Check if transcript is actually being received
3. Verify role is "assistant" (not typo or different value)
4. Check if message.content is a string or different type
5. Look for any uncaught errors in console

The enhanced logging should pinpoint exactly where the white screen is coming from!
