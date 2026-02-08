#!/bin/bash
# ============================================================
#  DOWNLOADS FOLDER CLEANUP SCRIPT
#  For macOS (MacBook Pro)
#
#  What this does:
#    1. Finds and lists duplicate files
#    2. Finds very large files (over 500MB)
#    3. Finds high-resolution images that are huge in file size
#    4. Organizes remaining files into tidy folders by type
#    5. Creates a report so you can review before deleting
#
#  HOW TO RUN:
#    Open Terminal on your Mac and type:
#      bash cleanup-downloads.sh
#
#  SAFE MODE: Nothing is deleted automatically.
#    You get a report first, then choose what to remove.
# ============================================================

set -euo pipefail

# -- Settings --
DOWNLOADS_DIR="$HOME/Downloads"
REPORT_FILE="$HOME/Downloads/_cleanup-report.txt"
DUPLICATES_DIR="$HOME/Downloads/_duplicates"
ORGANIZED_DIR="$HOME/Downloads/_organized"

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# -- Helper functions --
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

format_size() {
    local size=$1
    if [ "$size" -ge 1073741824 ]; then
        echo "$(( size / 1073741824 )) GB"
    elif [ "$size" -ge 1048576 ]; then
        echo "$(( size / 1048576 )) MB"
    elif [ "$size" -ge 1024 ]; then
        echo "$(( size / 1024 )) KB"
    else
        echo "$size bytes"
    fi
}

# ============================================================
#  START
# ============================================================

print_header "Downloads Folder Cleanup"
echo "  Scanning: $DOWNLOADS_DIR"
echo ""

# Check the Downloads folder exists
if [ ! -d "$DOWNLOADS_DIR" ]; then
    echo -e "${RED}  ERROR: Downloads folder not found at $DOWNLOADS_DIR${NC}"
    exit 1
fi

# Start the report
{
    echo "=========================================="
    echo "  DOWNLOADS CLEANUP REPORT"
    echo "  Generated: $(date)"
    echo "=========================================="
    echo ""
} > "$REPORT_FILE"

# ============================================================
#  STEP 1: Count what we're working with
# ============================================================
print_header "Step 1: Scanning your Downloads folder"

TOTAL_FILES=$(find "$DOWNLOADS_DIR" -maxdepth 1 -type f | wc -l | tr -d ' ')
TOTAL_SIZE=$(du -sh "$DOWNLOADS_DIR" 2>/dev/null | cut -f1)

print_step "Found $TOTAL_FILES files"
print_step "Total size: $TOTAL_SIZE"
echo ""

{
    echo "SUMMARY"
    echo "-------"
    echo "  Total files: $TOTAL_FILES"
    echo "  Total size:  $TOTAL_SIZE"
    echo ""
} >> "$REPORT_FILE"

# ============================================================
#  STEP 2: Find duplicate files (same name pattern)
# ============================================================
print_header "Step 2: Finding duplicate files"

DUPLICATE_COUNT=0
{
    echo "DUPLICATE FILES (files with copy/number patterns)"
    echo "--------------------------------------------------"
} >> "$REPORT_FILE"

# Find files that look like duplicates (common macOS patterns)
# e.g., "file (1).pdf", "file copy.pdf", "file-2.pdf"
while IFS= read -r file; do
    if [ -n "$file" ]; then
        DUPLICATE_COUNT=$((DUPLICATE_COUNT + 1))
        FILE_SIZE=$(stat -f%z "$file" 2>/dev/null || stat --format=%s "$file" 2>/dev/null || echo "0")
        echo "  $(format_size "$FILE_SIZE")  - $(basename "$file")" >> "$REPORT_FILE"
    fi
done < <(find "$DOWNLOADS_DIR" -maxdepth 1 -type f \( \
    -name "* ([0-9])*" -o \
    -name "* ([0-9][0-9])*" -o \
    -name "* copy*" -o \
    -name "* Copy*" -o \
    -name "*-[0-9].*" -o \
    -name "*_[0-9].*" \
\) 2>/dev/null)

if [ "$DUPLICATE_COUNT" -eq 0 ]; then
    print_step "No obvious duplicates found"
    echo "  No obvious duplicates found." >> "$REPORT_FILE"
else
    print_warning "Found $DUPLICATE_COUNT possible duplicates"
fi
echo "" >> "$REPORT_FILE"

# ============================================================
#  STEP 3: Find exact duplicates using checksums
# ============================================================
print_header "Step 3: Finding exact duplicate files (by content)"

{
    echo "EXACT DUPLICATES (identical file contents)"
    echo "-------------------------------------------"
} >> "$REPORT_FILE"

EXACT_DUP_COUNT=0

# Use md5 checksums to find exact duplicates
# Build a list of checksums for all files
CHECKSUM_FILE=$(mktemp)
find "$DOWNLOADS_DIR" -maxdepth 1 -type f ! -name "_cleanup-report.txt" -print0 2>/dev/null | \
while IFS= read -r -d '' file; do
    if [ -f "$file" ]; then
        # Use md5 on macOS, md5sum on Linux
        if command -v md5 &>/dev/null; then
            HASH=$(md5 -q "$file" 2>/dev/null || echo "error")
        else
            HASH=$(md5sum "$file" 2>/dev/null | cut -d' ' -f1 || echo "error")
        fi
        if [ "$HASH" != "error" ]; then
            echo "$HASH  $file"
        fi
    fi
done > "$CHECKSUM_FILE"

# Find duplicate checksums
if [ -s "$CHECKSUM_FILE" ]; then
    PREV_HASH=""
    PREV_FILE=""
    sort "$CHECKSUM_FILE" | while IFS= read -r line; do
        HASH=$(echo "$line" | cut -d' ' -f1)
        FILE=$(echo "$line" | cut -d' ' -f3-)
        if [ "$HASH" = "$PREV_HASH" ] && [ -n "$PREV_HASH" ]; then
            EXACT_DUP_COUNT=$((EXACT_DUP_COUNT + 1))
            FILE_SIZE=$(stat -f%z "$FILE" 2>/dev/null || stat --format=%s "$FILE" 2>/dev/null || echo "0")
            echo "  DUPLICATE: $(basename "$FILE")" >> "$REPORT_FILE"
            echo "  ORIGINAL:  $(basename "$PREV_FILE")" >> "$REPORT_FILE"
            echo "  Size: $(format_size "$FILE_SIZE")" >> "$REPORT_FILE"
            echo "" >> "$REPORT_FILE"
        fi
        PREV_HASH="$HASH"
        PREV_FILE="$FILE"
    done
fi
rm -f "$CHECKSUM_FILE"

print_step "Exact duplicate scan complete (see report)"
echo "" >> "$REPORT_FILE"

# ============================================================
#  STEP 4: Find very large files
# ============================================================
print_header "Step 4: Finding large files (over 100MB)"

LARGE_COUNT=0
{
    echo "LARGE FILES (over 100MB)"
    echo "------------------------"
} >> "$REPORT_FILE"

while IFS= read -r file; do
    if [ -n "$file" ]; then
        LARGE_COUNT=$((LARGE_COUNT + 1))
        FILE_SIZE=$(stat -f%z "$file" 2>/dev/null || stat --format=%s "$file" 2>/dev/null || echo "0")
        echo "  $(format_size "$FILE_SIZE")  - $(basename "$file")" >> "$REPORT_FILE"
    fi
done < <(find "$DOWNLOADS_DIR" -maxdepth 1 -type f -size +100M 2>/dev/null)

if [ "$LARGE_COUNT" -eq 0 ]; then
    print_step "No files over 100MB found"
    echo "  No files over 100MB found." >> "$REPORT_FILE"
else
    print_warning "Found $LARGE_COUNT files over 100MB"
fi
echo "" >> "$REPORT_FILE"

# ============================================================
#  STEP 5: Find large image files (high resolution)
# ============================================================
print_header "Step 5: Finding large image files"

LARGE_IMG_COUNT=0
{
    echo "LARGE IMAGES (over 10MB - likely very high resolution)"
    echo "------------------------------------------------------"
} >> "$REPORT_FILE"

while IFS= read -r file; do
    if [ -n "$file" ]; then
        LARGE_IMG_COUNT=$((LARGE_IMG_COUNT + 1))
        FILE_SIZE=$(stat -f%z "$file" 2>/dev/null || stat --format=%s "$file" 2>/dev/null || echo "0")
        echo "  $(format_size "$FILE_SIZE")  - $(basename "$file")" >> "$REPORT_FILE"

        # Try to get image dimensions if sips is available (macOS)
        if command -v sips &>/dev/null; then
            DIMENSIONS=$(sips -g pixelHeight -g pixelWidth "$file" 2>/dev/null | grep pixel | awk '{print $2}' | tr '\n' 'x' | sed 's/x$//')
            if [ -n "$DIMENSIONS" ]; then
                echo "              Dimensions: ${DIMENSIONS} pixels" >> "$REPORT_FILE"
            fi
        fi
    fi
done < <(find "$DOWNLOADS_DIR" -maxdepth 1 -type f -size +10M \( \
    -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o \
    -iname "*.tiff" -o -iname "*.tif" -o -iname "*.bmp" -o \
    -iname "*.raw" -o -iname "*.heic" -o -iname "*.webp" -o \
    -iname "*.psd" \
\) 2>/dev/null)

if [ "$LARGE_IMG_COUNT" -eq 0 ]; then
    print_step "No oversized images found"
    echo "  No oversized images found." >> "$REPORT_FILE"
else
    print_warning "Found $LARGE_IMG_COUNT large images"
fi
echo "" >> "$REPORT_FILE"

# ============================================================
#  STEP 6: Offer to organize files by type
# ============================================================
print_header "Step 6: Organize files by type"

{
    echo "FILE ORGANIZATION PLAN"
    echo "----------------------"
    echo "  Files will be sorted into these folders:"
    echo "    Documents/  - PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX, CSV"
    echo "    Images/     - JPG, PNG, GIF, SVG, WEBP, HEIC, TIFF, BMP, PSD"
    echo "    Videos/     - MP4, MOV, AVI, MKV, WMV, FLV, WEBM"
    echo "    Audio/      - MP3, WAV, AAC, FLAC, OGG, M4A, WMA"
    echo "    Archives/   - ZIP, RAR, 7Z, TAR, GZ, DMG, ISO"
    echo "    Code/       - JS, PY, HTML, CSS, JSON, XML, SH, TS"
    echo "    Apps/       - DMG, PKG, APP"
    echo "    Other/      - Everything else"
    echo ""
} >> "$REPORT_FILE"

echo ""
echo -e "${GREEN}  The report has been saved to:${NC}"
echo -e "${YELLOW}  $REPORT_FILE${NC}"
echo ""

# ============================================================
#  STEP 7: Ask what the user wants to do
# ============================================================
print_header "What would you like to do?"

echo "  1) ORGANIZE  - Sort files into folders by type"
echo "  2) DUPLICATES - Move duplicate files to _duplicates folder"
echo "  3) BOTH      - Organize AND move duplicates"
echo "  4) NOTHING   - Just keep the report, I'll review it first"
echo ""
read -rp "  Enter your choice (1/2/3/4): " CHOICE

case $CHOICE in
    1|3)
        print_step "Organizing files into folders..."
        mkdir -p "$ORGANIZED_DIR"/{Documents,Images,Videos,Audio,Archives,Code,Apps,Other}

        for file in "$DOWNLOADS_DIR"/*; do
            # Skip directories and our special folders
            [ ! -f "$file" ] && continue
            [[ "$(basename "$file")" == _* ]] && continue
            [[ "$(basename "$file")" == .* ]] && continue

            EXT="${file##*.}"
            EXT_LOWER=$(echo "$EXT" | tr '[:upper:]' '[:lower:]')
            DEST="Other"

            case "$EXT_LOWER" in
                pdf|doc|docx|txt|rtf|xls|xlsx|ppt|pptx|csv|odt|ods|odp|pages|numbers|keynote)
                    DEST="Documents" ;;
                jpg|jpeg|png|gif|svg|webp|heic|tiff|tif|bmp|psd|raw|ico)
                    DEST="Images" ;;
                mp4|mov|avi|mkv|wmv|flv|webm|m4v|3gp)
                    DEST="Videos" ;;
                mp3|wav|aac|flac|ogg|m4a|wma|aiff)
                    DEST="Audio" ;;
                zip|rar|7z|tar|gz|bz2|xz|iso)
                    DEST="Archives" ;;
                js|py|html|css|json|xml|sh|ts|jsx|tsx|rb|go|rs|c|cpp|h|java|swift|kt)
                    DEST="Code" ;;
                dmg|pkg|app)
                    DEST="Apps" ;;
            esac

            mv "$file" "$ORGANIZED_DIR/$DEST/" 2>/dev/null && \
                print_step "Moved $(basename "$file") -> $DEST/"
        done

        echo ""
        print_step "Done! Check $ORGANIZED_DIR"
        ;;&
    2|3)
        print_step "Moving duplicates to $_duplicates folder..."
        mkdir -p "$DUPLICATES_DIR"

        find "$DOWNLOADS_DIR" -maxdepth 1 -type f \( \
            -name "* ([0-9])*" -o \
            -name "* ([0-9][0-9])*" -o \
            -name "* copy*" -o \
            -name "* Copy*" \
        \) -exec mv {} "$DUPLICATES_DIR/" \; 2>/dev/null

        DUP_MOVED=$(find "$DUPLICATES_DIR" -type f | wc -l | tr -d ' ')
        print_step "Moved $DUP_MOVED duplicate files to $DUPLICATES_DIR"
        echo ""
        print_warning "Review the _duplicates folder before deleting!"
        ;;
    4)
        print_step "No changes made. Review the report at:"
        echo -e "  ${YELLOW}$REPORT_FILE${NC}"
        ;;
    *)
        print_step "Invalid choice. No changes made."
        ;;
esac

# ============================================================
#  DONE
# ============================================================
print_header "Cleanup Complete!"
echo "  Report saved to: $REPORT_FILE"
echo "  Open it with: open $REPORT_FILE"
echo ""
echo "  TIP: To permanently delete duplicates later, run:"
echo "       rm -rf $DUPLICATES_DIR"
echo ""
