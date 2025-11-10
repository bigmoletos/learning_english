#!/bin/bash

# Claude Code Status Line Script
# Displays: Git Branch | Working Directory | Git Status | Node.js Version | Time
# Uses colors and icons for visual appeal

# Read JSON input from stdin
input=$(cat)

# Extract current directory from JSON input (using grep/sed instead of jq)
cwd=$(echo "$input" | grep -o '"current_dir":"[^"]*"' | sed 's/"current_dir":"\(.*\)"/\1/')

# If we couldn't get cwd from JSON, use pwd as fallback
if [ -z "$cwd" ]; then
    cwd=$(pwd)
fi

# Change to the working directory
cd "$cwd" 2>/dev/null || cd "$(pwd)"

# ANSI Color codes (dimmed for status line)
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
    # Get basename of current directory
    dir_name=$(basename "$cwd")
    printf "${BLUE}${FOLDER_ICON} ${dir_name}${RESET}"
}

# Function to get git status
get_git_status() {
    if git rev-parse --git-dir > /dev/null 2>&1; then
        # Skip optional locks for performance
        export GIT_OPTIONAL_LOCKS=0
        
        # Check if there are any changes
        if git diff --quiet 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
            # Check for untracked files
            if [ -z "$(git ls-files --others --exclude-standard 2>/dev/null)" ]; then
                printf "${GREEN}${CLEAN_ICON} clean${RESET}"
            else
                printf "${YELLOW}${MODIFIED_ICON} untracked${RESET}"
            fi
        else
            printf "${YELLOW}${MODIFIED_ICON} modified${RESET}"
        fi
        
        unset GIT_OPTIONAL_LOCKS
    else
        printf "${WHITE}no repo${RESET}"
    fi
}

# Function to get Node.js version
get_node_version() {
    if command -v node > /dev/null 2>&1; then
        node_ver=$(node -v 2>/dev/null)
        printf "${GREEN}${NODE_ICON} ${node_ver}${RESET}"
    else
        printf "${RED}${NODE_ICON} n/a${RESET}"
    fi
}

# Function to get current time
get_time() {
    current_time=$(date +%H:%M:%S)
    printf "${CYAN}${TIME_ICON} ${current_time}${RESET}"
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
status_line+="$(get_time)"

# Output the status line
printf "%b\n" "$status_line"
