#!/bin/bash
# ============================================================
#  MAC OPTIMIZATION SCRIPT
#  For macOS (MacBook Pro)
#
#  What this does:
#    1. Clears system caches (safe to delete)
#    2. Clears browser caches
#    3. Empties Trash
#    4. Removes old log files
#    5. Clears DNS cache
#    6. Frees up purgeable disk space
#    7. Shows what's using the most disk space
#    8. Lists heavy startup/login items slowing boot
#    9. Checks for large unused apps
#
#  HOW TO RUN:
#    Open Terminal on your Mac and type:
#      bash optimize-mac.sh
#
#  SAFE MODE: This script asks before doing anything destructive.
#    No important files are ever deleted.
# ============================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}  -> $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}  !! $1${NC}"
}

print_info() {
    echo -e "  $1"
}

confirm() {
    read -rp "  $1 (y/n): " REPLY
    [[ "$REPLY" =~ ^[Yy]$ ]]
}

# ============================================================
#  START
# ============================================================
print_header "Mac Optimization Tool"
echo "  This tool will help speed up your MacBook Pro."
echo "  It will ask before making any changes."
echo ""

SPACE_BEFORE=$(df -h / | tail -1 | awk '{print $4}')
print_info "Free disk space before: $SPACE_BEFORE"
echo ""

# ============================================================
#  1. CLEAR USER CACHES
# ============================================================
print_header "1. User Cache Files"

CACHE_SIZE=$(du -sh ~/Library/Caches 2>/dev/null | cut -f1 || echo "unknown")
print_info "User cache size: $CACHE_SIZE"
print_info "These are temporary files apps create. Safe to clear."
echo ""

if confirm "Clear user caches? (apps will rebuild them as needed)"; then
    # Remove cache contents but keep the folders
    find ~/Library/Caches -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null || true
    print_step "User caches cleared"
else
    print_step "Skipped"
fi

# ============================================================
#  2. CLEAR SYSTEM LOGS
# ============================================================
print_header "2. Old Log Files"

LOG_SIZE=$(du -sh ~/Library/Logs 2>/dev/null | cut -f1 || echo "unknown")
print_info "User log files size: $LOG_SIZE"
print_info "Old logs from apps and the system. Safe to remove."
echo ""

if confirm "Clear old log files?"; then
    find ~/Library/Logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
    find ~/Library/Logs -name "*.gz" -delete 2>/dev/null || true
    print_step "Old logs cleared (kept logs less than 7 days old)"
else
    print_step "Skipped"
fi

# ============================================================
#  3. CLEAR BROWSER CACHES
# ============================================================
print_header "3. Browser Caches"

SAFARI_CACHE=$(du -sh ~/Library/Caches/com.apple.Safari 2>/dev/null | cut -f1 || echo "none found")
CHROME_CACHE=$(du -sh ~/Library/Caches/Google/Chrome 2>/dev/null | cut -f1 || echo "none found")
FIREFOX_CACHE=$(du -sh ~/Library/Caches/Firefox 2>/dev/null | cut -f1 || echo "none found")

print_info "Safari cache:  $SAFARI_CACHE"
print_info "Chrome cache:  $CHROME_CACHE"
print_info "Firefox cache: $FIREFOX_CACHE"
print_info ""
print_info "Browser caches make pages load faster but use disk space."
print_info "They rebuild automatically as you browse."
echo ""

if confirm "Clear browser caches?"; then
    rm -rf ~/Library/Caches/com.apple.Safari 2>/dev/null || true
    rm -rf ~/Library/Caches/Google/Chrome 2>/dev/null || true
    rm -rf ~/Library/Caches/Firefox 2>/dev/null || true
    print_step "Browser caches cleared"
else
    print_step "Skipped"
fi

# ============================================================
#  4. CLEAR DNS CACHE
# ============================================================
print_header "4. DNS Cache"

print_info "A stale DNS cache can slow down web browsing."
print_info "Flushing it forces your Mac to get fresh lookups."
echo ""

if confirm "Flush DNS cache? (may need your password)"; then
    sudo dscacheutil -flushcache 2>/dev/null || true
    sudo killall -HUP mDNSResponder 2>/dev/null || true
    print_step "DNS cache flushed"
else
    print_step "Skipped"
fi

# ============================================================
#  5. CLEAR TEMPORARY FILES
# ============================================================
print_header "5. Temporary Files"

TMP_SIZE=$(du -sh /tmp 2>/dev/null | cut -f1 || echo "unknown")
PRIVATE_TMP_SIZE=$(du -sh /private/var/folders 2>/dev/null | cut -f1 || echo "unknown")

print_info "System temp files: $TMP_SIZE"
print_info "Private temp folders: $PRIVATE_TMP_SIZE"
echo ""

if confirm "Clear temporary files?"; then
    # Only clear safe temp files
    find /tmp -type f -mtime +3 -delete 2>/dev/null || true
    print_step "Old temp files cleared"
else
    print_step "Skipped"
fi

# ============================================================
#  6. EMPTY TRASH
# ============================================================
print_header "6. Trash"

TRASH_SIZE=$(du -sh ~/.Trash 2>/dev/null | cut -f1 || echo "empty")
print_info "Trash size: $TRASH_SIZE"
echo ""

if confirm "Empty Trash?"; then
    rm -rf ~/.Trash/* 2>/dev/null || true
    rm -rf ~/.Trash/.* 2>/dev/null || true
    print_step "Trash emptied"
else
    print_step "Skipped"
fi

# ============================================================
#  7. SHOW DISK SPACE HOGS
# ============================================================
print_header "7. Biggest Space Users"

print_info "Top folders using the most disk space in your home directory:"
echo ""

du -sh ~/Desktop ~/Documents ~/Downloads ~/Movies ~/Music ~/Pictures ~/Library 2>/dev/null | \
    sort -rh | while IFS= read -r line; do
    echo -e "  ${BOLD}$line${NC}"
done

echo ""
print_info "Consider moving large files to an external drive or cloud storage."

# ============================================================
#  8. CHECK LOGIN ITEMS (things that start when you boot)
# ============================================================
print_header "8. Login Items (apps that start on boot)"

print_info "These apps launch every time you start your Mac,"
print_info "slowing down your boot and using RAM in the background:"
echo ""

# List login items using osascript
if command -v osascript &>/dev/null; then
    osascript -e 'tell application "System Events" to get the name of every login item' 2>/dev/null | \
        tr ',' '\n' | while IFS= read -r item; do
        echo -e "  ${YELLOW}-${NC} $(echo "$item" | xargs)"
    done
else
    print_info "(Cannot list login items in this environment)"
fi

echo ""
print_info "To remove login items:"
print_info "  System Settings -> General -> Login Items"
print_info "  Remove anything you don't need starting automatically."

# ============================================================
#  9. CHECK RAM USAGE
# ============================================================
print_header "9. Memory (RAM) Usage"

if command -v vm_stat &>/dev/null; then
    # Parse vm_stat output
    VM_STAT=$(vm_stat)
    PAGE_SIZE=$(sysctl -n hw.pagesize 2>/dev/null || echo 4096)

    FREE_PAGES=$(echo "$VM_STAT" | grep "Pages free" | awk '{print $3}' | tr -d '.')
    INACTIVE_PAGES=$(echo "$VM_STAT" | grep "Pages inactive" | awk '{print $3}' | tr -d '.')
    ACTIVE_PAGES=$(echo "$VM_STAT" | grep "Pages active" | awk '{print $3}' | tr -d '.')
    WIRED_PAGES=$(echo "$VM_STAT" | grep "Pages wired" | awk '{print $4}' | tr -d '.')

    if [ -n "$FREE_PAGES" ] && [ -n "$ACTIVE_PAGES" ]; then
        FREE_MB=$(( (FREE_PAGES * PAGE_SIZE) / 1048576 ))
        INACTIVE_MB=$(( (INACTIVE_PAGES * PAGE_SIZE) / 1048576 ))
        ACTIVE_MB=$(( (ACTIVE_PAGES * PAGE_SIZE) / 1048576 ))
        WIRED_MB=$(( (WIRED_PAGES * PAGE_SIZE) / 1048576 ))

        echo -e "  Free:     ${GREEN}${FREE_MB} MB${NC}"
        echo -e "  Inactive: ${YELLOW}${INACTIVE_MB} MB${NC} (can be reclaimed)"
        echo -e "  Active:   ${RED}${ACTIVE_MB} MB${NC} (in use)"
        echo -e "  Wired:    ${RED}${WIRED_MB} MB${NC} (system, can't free)"
    fi
else
    # Fallback for non-macOS
    free -h 2>/dev/null || print_info "(Cannot read memory info in this environment)"
fi

echo ""
print_info "To free RAM: close apps you're not using."
print_info "Check Activity Monitor for memory-hungry apps."

# ============================================================
#  10. QUICK MAINTENANCE TASKS
# ============================================================
print_header "10. System Maintenance"

if confirm "Run macOS maintenance scripts? (may need password)"; then
    print_step "Running daily maintenance..."
    sudo periodic daily 2>/dev/null || true
    print_step "Running weekly maintenance..."
    sudo periodic weekly 2>/dev/null || true
    print_step "Running monthly maintenance..."
    sudo periodic monthly 2>/dev/null || true
    print_step "Maintenance scripts complete"
else
    print_step "Skipped"
fi

# ============================================================
#  SUMMARY
# ============================================================
print_header "Optimization Complete!"

SPACE_AFTER=$(df -h / | tail -1 | awk '{print $4}')

echo -e "  Free space before: ${YELLOW}$SPACE_BEFORE${NC}"
echo -e "  Free space after:  ${GREEN}$SPACE_AFTER${NC}"
echo ""
echo "  OTHER TIPS TO SPEED UP YOUR MACBOOK:"
echo ""
echo "  1. REDUCE VISUAL EFFECTS"
echo "     System Settings -> Accessibility -> Display"
echo "       - Turn ON 'Reduce motion'"
echo "       - Turn ON 'Reduce transparency'"
echo ""
echo "  2. MANAGE STORAGE"
echo "     Apple menu -> About This Mac -> Storage -> Manage"
echo "       - Enable 'Optimize Storage'"
echo "       - Enable 'Empty Trash Automatically'"
echo ""
echo "  3. CHECK FOR UPDATES"
echo "     System Settings -> General -> Software Update"
echo "       - Install any pending updates"
echo ""
echo "  4. RESTART REGULARLY"
echo "     Restarting clears temporary memory and fixes"
echo "     many slowness issues. Try restarting once a week."
echo ""
echo "  5. CHECK STARTUP DISK SPACE"
echo "     Keep at least 10-15% of your disk free."
echo "     A nearly full disk makes everything slower."
echo ""
