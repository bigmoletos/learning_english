#!/bin/bash

# Parse Claude Code transcript to extract token usage statistics
# Usage: parse_transcript.sh <transcript_path>

TRANSCRIPT_PATH="$1"

# Check if transcript file exists and is readable
if [ ! -f "$TRANSCRIPT_PATH" ]; then
    echo "{\"input_tokens\":0,\"output_tokens\":0,\"cache_read_tokens\":0,\"cache_creation_tokens\":0,\"total_tokens\":0,\"message_count\":0,\"last_prompt_tokens\":0}"
    exit 0
fi

# Initialize counters
input_tokens=0
output_tokens=0
cache_read_tokens=0
cache_creation_tokens=0
message_count=0
last_input=0
last_output=0
last_cache_read=0
last_cache_creation=0

# Read the transcript file line by line (JSONL format)
while IFS= read -r line; do
    # Skip empty lines
    [ -z "$line" ] && continue

    # Check if this is a message with usage data
    if echo "$line" | grep -q '"usage"'; then
        # Extract token counts from usage object
        input=$(echo "$line" | grep -o '"input_tokens":[0-9]*' | grep -o '[0-9]*' | head -1)
        output=$(echo "$line" | grep -o '"output_tokens":[0-9]*' | grep -o '[0-9]*' | head -1)
        cache_read=$(echo "$line" | grep -o '"cache_read_input_tokens":[0-9]*' | grep -o '[0-9]*' | head -1)
        cache_creation=$(echo "$line" | grep -o '"cache_creation_input_tokens":[0-9]*' | grep -o '[0-9]*' | head -1)

        # Store as last prompt tokens
        [ -n "$input" ] && last_input=$input || last_input=0
        [ -n "$output" ] && last_output=$output || last_output=0
        [ -n "$cache_read" ] && last_cache_read=$cache_read || last_cache_read=0
        [ -n "$cache_creation" ] && last_cache_creation=$cache_creation || last_cache_creation=0

        # Add to totals
        [ -n "$input" ] && input_tokens=$((input_tokens + input))
        [ -n "$output" ] && output_tokens=$((output_tokens + output))
        [ -n "$cache_read" ] && cache_read_tokens=$((cache_read_tokens + cache_read))
        [ -n "$cache_creation" ] && cache_creation_tokens=$((cache_creation_tokens + cache_creation))

        # Increment message count
        message_count=$((message_count + 1))
    fi
done < "$TRANSCRIPT_PATH"

# Calculate total tokens
total_tokens=$((input_tokens + output_tokens + cache_read_tokens + cache_creation_tokens))

# Calculate last prompt total
last_prompt_tokens=$((last_input + last_output + last_cache_read + last_cache_creation))

# Output as JSON
cat <<EOF
{
  "input_tokens": $input_tokens,
  "output_tokens": $output_tokens,
  "cache_read_tokens": $cache_read_tokens,
  "cache_creation_tokens": $cache_creation_tokens,
  "total_tokens": $total_tokens,
  "message_count": $message_count,
  "last_prompt_tokens": $last_prompt_tokens
}
EOF
