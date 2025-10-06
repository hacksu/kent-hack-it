#!/bin/bash

# Auto-processing script for beheader polyglot generator
# Automatically processes files from input_files folder and outputs to output folder

set -e

INPUT_FOLDER="input_files"
OUTPUT_FOLDER="output"
SHOW_HELP=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            SHOW_HELP=true
            shift
            ;;
        *)
            if [ -z "$INPUT_FOLDER_SET" ]; then
                INPUT_FOLDER="$1"
                INPUT_FOLDER_SET=true
            elif [ -z "$OUTPUT_FOLDER_SET" ]; then
                OUTPUT_FOLDER="$1"
                OUTPUT_FOLDER_SET=true
            fi
            shift
            ;;
    esac
done

if [ "$SHOW_HELP" = true ]; then
    cat << EOF
Auto-processing script for beheader polyglot generator

Usage: ./auto_process.sh [input_folder] [output_folder] [--help]

Parameters:
    input_folder     Source folder containing files to process (default: input_files)
    output_folder    Destination folder for polyglot outputs (default: output)
    --help, -h      Show this help message

The script will automatically:
1. Scan the input folder for supported file types
2. Create polyglot combinations based on available files
3. Output results to the specified output folder

Supported file types:
- Images: .png, .jpg, .jpeg, .gif, .bmp, .ico
- Video/Audio: .mp4, .avi, .mov, .wav, .mp3, .flv
- HTML: .html, .htm
- PDF: .pdf
- ZIP: .zip, .jar, .apk, .docx, .xlsx, .pptx
- Other files will be treated as appendables

Dependencies required:
- bun (JavaScript runtime)
- ffmpeg and ffprobe
- ImageMagick (convert command)
- zip and unzip
- mp4edit (Bento4)

EOF
    exit 0
fi

echo "Auto-processing script for beheader polyglot generator"
echo "====================================================="

# Check dependencies
echo "Checking dependencies..."

# Add bun to PATH if it exists but isn't in PATH
if [ -f "$HOME/.bun/bin/bun" ] && ! command -v bun &> /dev/null; then
    export PATH="$HOME/.bun/bin:$PATH"
    echo "Added ~/.bun/bin to PATH"
fi

check_dependency() {
    if ! command -v "$1" &> /dev/null; then
        echo "❌ $1 is not installed or not in PATH"
        return 1
    else
        echo "✓ $1 found"
        return 0
    fi
}

DEPS_OK=true
check_dependency "bun" || DEPS_OK=false
check_dependency "ffmpeg" || DEPS_OK=false
check_dependency "ffprobe" || DEPS_OK=false
check_dependency "convert" || DEPS_OK=false
check_dependency "zip" || DEPS_OK=false
check_dependency "unzip" || DEPS_OK=false

# Special handling for mp4edit - check multiple locations
mp4edit_found=false
if [ -f "mp4edit" ]; then
    echo "✓ mp4edit found (current directory)"
    mp4edit_found=true
elif command -v mp4edit &> /dev/null; then
    echo "✓ mp4edit found (in PATH)"
    mp4edit_found=true
else
    # Look for mp4edit.exe in Bento4 SDK
    bento4_mp4edit=$(find . -name "mp4edit.exe" 2>/dev/null | head -1)
    if [ -n "$bento4_mp4edit" ]; then
        echo "✓ mp4edit.exe found (Bento4 SDK)"
        mp4edit_found=true
        # Add to PATH for this session
        bento4_path=$(dirname "$bento4_mp4edit")
        export PATH="$bento4_path:$PATH"
        # Create a symlink without .exe for easier usage
        if [ ! -f "$bento4_path/mp4edit" ]; then
            ln -s "$bento4_path/mp4edit.exe" "$bento4_path/mp4edit" 2>/dev/null || true
        fi
    else
        echo "❌ mp4edit not found (should be in current directory, PATH, or Bento4 SDK)"
        DEPS_OK=false
    fi
fi

if [ "$DEPS_OK" = false ]; then
    echo ""
    echo "Please install missing dependencies before running this script."
    echo "See the README for installation instructions."
    exit 1
fi

echo ""

# Ensure folders exist
if [ ! -d "$INPUT_FOLDER" ]; then
    echo "Error: Input folder '$INPUT_FOLDER' does not exist!"
    exit 1
fi

if [ ! -d "$OUTPUT_FOLDER" ]; then
    mkdir -p "$OUTPUT_FOLDER"
    echo "Created output folder: $OUTPUT_FOLDER"
fi

# Get all files from input folder
FILES=()
while IFS= read -r -d '' file; do
    FILES+=("$file")
done < <(find "$INPUT_FOLDER" -type f -size +0c -print0 2>/dev/null)

if [ ${#FILES[@]} -eq 0 ]; then
    echo "No files found in input folder '$INPUT_FOLDER'"
    exit 0
fi

echo "Found ${#FILES[@]} files in input folder"

# Categorize files
IMAGES=()
VIDEOS=()
HTML_FILES=()
PDF_FILES=()
ZIP_FILES=()
OTHER_FILES=()

for file in "${FILES[@]}"; do
    ext=$(echo "${file##*.}" | tr '[:upper:]' '[:lower:]')
    case "$ext" in
        png|jpg|jpeg|gif|bmp|ico)
            IMAGES+=("$file")
            ;;
        mp4|avi|mov|wav|mp3|flv|mkv|webm)
            VIDEOS+=("$file")
            ;;
        html|htm)
            HTML_FILES+=("$file")
            ;;
        pdf)
            PDF_FILES+=("$file")
            ;;
        zip|jar|apk|docx|xlsx|pptx)
            ZIP_FILES+=("$file")
            ;;
        *)
            # Only include small files as appendables
            if [ $(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null) -lt 204800 ]; then
                OTHER_FILES+=("$file")
            fi
            ;;
    esac
done

echo "File categorization:"
echo "  Images: ${#IMAGES[@]}"
echo "  Videos/Audio: ${#VIDEOS[@]}"
echo "  HTML files: ${#HTML_FILES[@]}"
echo "  PDF files: ${#PDF_FILES[@]}"
echo "  ZIP files: ${#ZIP_FILES[@]}"
echo "  Other files: ${#OTHER_FILES[@]}"

# Function to run beheader
run_beheader() {
    local output_file="$1"
    local image_file="$2"
    local video_file="$3"
    shift 3
    local additional_args=("$@")
    
    local cmd=(bun run beheader.js "$output_file" "$image_file" "$video_file")
    cmd+=("${additional_args[@]}")
    
    echo "Executing: ${cmd[*]}"
    
    if "${cmd[@]}" 2>&1; then
        echo "✓ Successfully created: $output_file"
        return 0
    else
        local exit_code=$?
        echo "✗ Failed to create: $output_file (Exit code: $exit_code)"
        return 1
    fi
}

# Main processing logic
PROCESSED_COUNT=0
SUCCESS_COUNT=0

if [ ${#IMAGES[@]} -gt 0 ] && [ ${#VIDEOS[@]} -gt 0 ]; then
    echo ""
    echo "Processing image-video combinations..."
    
    for image in "${IMAGES[@]}"; do
        for video in "${VIDEOS[@]}"; do
            image_name=$(basename "$image" | sed 's/\.[^.]*$//')
            video_name=$(basename "$video" | sed 's/\.[^.]*$//')
            output_name="${image_name}_${video_name}_polyglot.mp4"
            output_path="$OUTPUT_FOLDER/$output_name"
            
            # Prepare additional arguments
            additional_args=()
            
            # Add HTML files if any
            if [ ${#HTML_FILES[@]} -gt 0 ]; then
                additional_args+=(-h "${HTML_FILES[0]}")
            fi
            
            # Add PDF files if any
            if [ ${#PDF_FILES[@]} -gt 0 ]; then
                additional_args+=(-p "${PDF_FILES[0]}")
            fi
            
            # Add ZIP files if any
            for zip_file in "${ZIP_FILES[@]}"; do
                additional_args+=(-z "$zip_file")
            done
            
            # Add other files as appendables
            additional_args+=("${OTHER_FILES[@]}")
            
            ((PROCESSED_COUNT++))
            if run_beheader "$output_path" "$image" "$video" "${additional_args[@]}"; then
                ((SUCCESS_COUNT++))
            fi
        done
    done
else
    echo ""
    echo "Insufficient files for polyglot creation!"
    echo "Beheader requires at least one image file and one video/audio file."
    
    if [ ${#IMAGES[@]} -eq 0 ]; then
        echo "Missing image files. Supported formats: png, jpg, jpeg, gif, bmp, ico"
    fi
    
    if [ ${#VIDEOS[@]} -eq 0 ]; then
        echo "Missing video/audio files. Supported formats: mp4, avi, mov, wav, mp3, flv, mkv, webm"
    fi
    
    echo ""
    echo "Please add the required files to the '$INPUT_FOLDER' folder and run the script again."
fi

# Summary
echo ""
echo "=================================================="
echo "Processing Summary:"
echo "Files processed: $PROCESSED_COUNT"
echo "Successful: $SUCCESS_COUNT"
echo "Failed: $((PROCESSED_COUNT - SUCCESS_COUNT))"

if [ $SUCCESS_COUNT -gt 0 ]; then
    echo ""
    echo "Output files created in: $OUTPUT_FOLDER"
    echo "You can test the polyglot files by changing their extensions:"
    echo "  .ico - displays the image"
    echo "  .mp4 - plays the video"
    echo "  .html - shows the webpage (if HTML was included)"
    echo "  .pdf - opens the PDF (if PDF was included)"
    echo "  .zip - extracts the archive (if ZIP was included)"
fi