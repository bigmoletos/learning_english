#!/bin/bash

# Claude Code Status Line Script
# Displays: Git Branch | Working Directory | Git Status | Node.js Version | Tokens | Messages Usage | Cost USD | Session Time (remaining)

# Read JSON input from stdin
input=$(cat)

# Extract current directory from JSON input
cwd=$(echo "$input" | grep -o '"current_dir":"[^"]*"' | sed 's/"current_dir":"\(.*\)"/\1/')

# If we couldn't get cwd from JSON, use pwd as fallback
if [ -z "$cwd" ]; then
    cwd=$(pwd)
fi

# Change to the working directory
cd "$cwd" 2>/dev/null || cd "$(pwd)"

# Extract transcript path from JSON input
transcript_path=$(echo "$input" | grep -o '"transcript_path":"[^"]*"' | sed 's/"transcript_path":"\(.*\)"/\1/')

# Parse transcript to get token stats
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
if [ -n "$transcript_path" ] && [ -f "$SCRIPT_DIR/parse_transcript.sh" ]; then
    token_stats=$("$SCRIPT_DIR/parse_transcript.sh" "$transcript_path" 2>/dev/null)
else
    token_stats='{"input_tokens":0,"output_tokens":0,"cache_read_tokens":0,"cache_creation_tokens":0,"total_tokens":0,"message_count":0}'
fi

# ANSI Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'
RESET='\033[0m'

# Icons
BRANCH_ICON="⎇"
FOLDER_ICON="📁"
CLEAN_ICON="✓"
MODIFIED_ICON="●"
NODE_ICON="⬢"
TIME_ICON="🕐"
TOKEN_ICON="🎫"
SESSION_ICON="⏱️"
MESSAGES_ICON="💬"
PERCENT_ICON="📊"

# Free tier limits (approximate)
FREE_TIER_MAX_MESSAGES=9
FREE_TIER_SESSION_HOURS=5

# Function to get git branch
get_git_branch() {
    if git rev-parse --git-dir > /dev/null 2>&1; then
        branch=$(git branch --show-current 2>/dev/null)
        if [ -z "$branch" ]; then
            branch=$(git rev-parse --short HEAD 2>/dev/null)
        fi
        printf "${MAGENTA}${BRANCH_ICON} ${branch}${RESET}"
    else
        printf "${MAGENTA}${BRANCH_ICON} none${RESET}"
    fi
}

# Function to get working directory (shortened)
get_working_dir() {
    dir_name=$(basename "$cwd")
    printf "${BLUE}${FOLDER_ICON} ${dir_name}${RESET}"
}

# Function to get git status
get_git_status() {
    if git rev-parse --git-dir > /dev/null 2>&1; then
        export GIT_OPTIONAL_LOCKS=0

        if git diff --quiet 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
            if [ -z "$(git ls-files --others --exclude-standard 2>/dev/null)" ]; then
                printf "${GREEN}git: clean${RESET}"
            else
                printf "${YELLOW}git: untracked${RESET}"
            fi
        else
            printf "${YELLOW}git: modified${RESET}"
        fi

        unset GIT_OPTIONAL_LOCKS
    else
        printf "${WHITE}git: no repo${RESET}"
    fi
}

# Function to get Node.js version
get_node_version() {
    if command -v node > /dev/null 2>&1; then
        node_ver=$(node -v 2>/dev/null)
        printf "${GREEN}node ${node_ver}${RESET}"
    else
        printf "${RED}node n/a${RESET}"
    fi
}

# Function to get current time
get_time() {
    current_time=$(date +%H:%M:%S)
    printf "${CYAN}${TIME_ICON} ${current_time}${RESET}"
}

# Function to get token usage
get_token_usage() {
    # Extract total tokens and last prompt tokens from parsed transcript
    total_tokens=$(echo "$token_stats" | grep -o '"total_tokens":[0-9]*' | grep -o '[0-9]*')
    last_prompt_tokens=$(echo "$token_stats" | grep -o '"last_prompt_tokens":[0-9]*' | grep -o '[0-9]*')

    if [ -z "$total_tokens" ]; then
        total_tokens=0
    fi

    if [ -z "$last_prompt_tokens" ]; then
        last_prompt_tokens=0
    fi

    # Format total tokens with K/M suffix for readability
    if [ "$total_tokens" -ge 1000000 ]; then
        total_display=$(awk "BEGIN {printf \"%.1fM\", $total_tokens/1000000}")
    elif [ "$total_tokens" -ge 1000 ]; then
        total_display=$(awk "BEGIN {printf \"%.1fK\", $total_tokens/1000}")
    else
        total_display="$total_tokens"
    fi

    # Format last prompt tokens with K/M suffix
    if [ "$last_prompt_tokens" -ge 1000000 ]; then
        last_display=$(awk "BEGIN {printf \"%.1fM\", $last_prompt_tokens/1000000}")
    elif [ "$last_prompt_tokens" -ge 1000 ]; then
        last_display=$(awk "BEGIN {printf \"%.1fK\", $last_prompt_tokens/1000}")
    else
        last_display="$last_prompt_tokens"
    fi

    # Color based on token count (approximate limits)
    if [ "$total_tokens" -lt 50000 ]; then
        color="${GREEN}"
    elif [ "$total_tokens" -lt 200000 ]; then
        color="${YELLOW}"
    else
        color="${RED}"
    fi

    printf "${color}tokens: ${last_display} (total: ${total_display})${RESET}"
}

# Function to get message count and usage percentage
get_message_usage() {
    # Extract message count from parsed transcript
    message_count=$(echo "$token_stats" | grep -o '"message_count":[0-9]*' | grep -o '[0-9]*')

    if [ -z "$message_count" ]; then
        message_count=0
    fi

    # Calculate percentage of free tier limit
    if [ "$message_count" -gt 0 ]; then
        percentage=$((message_count * 100 / FREE_TIER_MAX_MESSAGES))
    else
        percentage=0
    fi

    # Calculate remaining messages
    remaining_msgs=$((FREE_TIER_MAX_MESSAGES - message_count))

    # Color based on percentage
    if [ "$percentage" -lt 50 ]; then
        color="${GREEN}"
    elif [ "$percentage" -lt 80 ]; then
        color="${YELLOW}"
    else
        color="${RED}"
    fi

    printf "${color}usage: ${message_count}/${FREE_TIER_MAX_MESSAGES} msgs (${remaining_msgs} restants, ${percentage}%%)${RESET}"
}

# Function to get cost in USD
get_cost_usd() {
    # Extract cost info from JSON input
    total_cost=$(echo "$input" | grep -o '"total_cost_usd":[0-9.]*' | grep -o '[0-9.]*')

    if [ -n "$total_cost" ]; then
        # Round to 2 decimal places
        total_cost_rounded=$(awk "BEGIN {printf \"%.2f\", $total_cost}" 2>/dev/null)
        if [ -z "$total_cost_rounded" ]; then
            total_cost_rounded=$(printf "%.2f" "$total_cost")
        fi

        # Color based on cost
        cost_cents=$(echo "$total_cost * 100" | bc 2>/dev/null | cut -d. -f1)
        if [ -z "$cost_cents" ]; then
            cost_cents=$(awk "BEGIN {printf \"%.0f\", $total_cost * 100}")
        fi

        if [ "$cost_cents" -lt 10 ]; then
            color="${GREEN}"
        elif [ "$cost_cents" -lt 50 ]; then
            color="${YELLOW}"
        else
            color="${RED}"
        fi

        printf "${color}cost: \$${total_cost_rounded}${RESET}"
    else
        printf "${WHITE}cost: \$0.00${RESET}"
    fi
}

# Function to get session time elapsed and remaining
get_session_time() {
    # Extract total duration from JSON input (in milliseconds)
    total_duration=$(echo "$input" | grep -o '"total_duration_ms":[0-9]*' | grep -o '[0-9]*')

    if [ -n "$total_duration" ] && [ "$total_duration" -gt 0 ]; then
        # Convert milliseconds to seconds
        elapsed=$((total_duration / 1000))

        # Calculate remaining time (Free tier: 5 hours = 18000 seconds)
        max_session_seconds=$((FREE_TIER_SESSION_HOURS * 3600))
        remaining=$((max_session_seconds - elapsed))

        # Format elapsed time
        hours=$((elapsed / 3600))
        minutes=$(((elapsed % 3600) / 60))

        # Format remaining time
        if [ "$remaining" -gt 0 ]; then
            rem_hours=$((remaining / 3600))
            rem_minutes=$(((remaining % 3600) / 60))

            # Calculate percentage remaining
            percentage_remaining=$((remaining * 100 / max_session_seconds))

            # Color based on percentage remaining
            if [ "$percentage_remaining" -gt 50 ]; then
                color="${GREEN}"
            elif [ "$percentage_remaining" -gt 20 ]; then
                color="${YELLOW}"
            else
                color="${RED}"
            fi

            if [ "$rem_hours" -gt 0 ]; then
                remaining_display="${rem_hours}h${rem_minutes}m"
            else
                remaining_display="${rem_minutes}m"
            fi
        else
            color="${RED}"
            remaining_display="expired"
        fi

        # Display format: "elapsed (remaining left)"
        if [ "$hours" -gt 0 ]; then
            elapsed_display="${hours}h${minutes}m"
        else
            elapsed_display="${minutes}m"
        fi

        printf "${color}session: ${elapsed_display} (${remaining_display} restant)${RESET}"
    else
        printf "${WHITE}session: 0m (${FREE_TIER_SESSION_HOURS}h restant)${RESET}"
    fi
}

# Build the status line
status_line=""
status_line+="$(get_git_branch)"
status_line+=" | "
status_line+="$(get_working_dir)"
status_line+=" | "
status_line+="$(get_git_status)"
status_line+=" | "
status_line+="$(get_node_version)"
status_line+=" | "
status_line+="$(get_token_usage)"
status_line+=" | "
status_line+="$(get_message_usage)"
status_line+=" | "
status_line+="$(get_cost_usd)"
status_line+=" | "
status_line+="$(get_session_time)"

# Output the status line
printf "%b\n" "$status_line"
