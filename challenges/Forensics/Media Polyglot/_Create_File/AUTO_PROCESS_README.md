# Auto-Processing Scripts for Beheader

This folder contains automated scripts to process files from the `input_files` folder and create polyglot files in the `output` folder using the beheader tool.

**Built for:** [beheader](https://github.com/p2r3/beheader) - Polyglot generator for media files by [@p2r3](https://github.com/p2r3)

## Available Scripts

### WSL/Linux Script
**File:** `auto_process.sh`

**Usage:**
```bash
# From WSL terminal
./auto_process.sh

# From Windows PowerShell using WSL
wsl ./auto_process.sh

# Custom folders
./auto_process.sh my_input my_output

# Show help
./auto_process.sh --help
```

**Features:**
- Advanced file categorization and automatic detection
- Multiple combination processing
- Detailed progress reporting and dependency checking
- Error handling and validation
- Configurable input/output folders
- Full WSL integration with Linux tools

## Setup Instructions

1. **Prepare Input Files:**
   - Create or ensure the `input_files` folder exists
   - Add your files to the `input_files` folder
   - **Minimum requirement:** At least one image file AND one video/audio file

2. **Supported File Types:**
   - **Images:** .png, .jpg, .jpeg, .gif, .bmp, .ico
   - **Video/Audio:** .mp4, .avi, .mov, .wav, .mp3, .flv, .mkv, .webm
   - **HTML:** .html, .htm (optional)
   - **PDF:** .pdf (optional)
   - **Archives:** .zip, .jar, .apk, .docx, .xlsx, .pptx (optional)
   - **Other files:** Will be treated as appendables (limited to <200KB)

2. **Run the Script:**
   - From WSL: `./auto_process.sh`
   - From PowerShell: `wsl ./auto_process.sh`
   - Check the `output` folder for generated polyglot files

## Output Files

The generated polyglot files can be used with different extensions to access different content:

- **`.ico`** - Displays the embedded image
- **`.mp4`** - Plays the embedded video/audio
- **`.html`** - Shows the embedded webpage (if HTML was included)
- **`.pdf`** - Opens the embedded PDF (if PDF was included)
- **`.zip`** - Extracts the embedded archive (if ZIP was included)

## Configuration

You can customize the processing behavior by editing `auto_process_config.json`:

```json
{
  "input_folder": "input_files",
  "output_folder": "output",
  "settings": {
    "max_appendable_size": 204800,
    "output_format": "mp4",
    "include_all_zips": true,
    "include_all_pdfs": false,
    "include_all_html": false
  }
}
```

## Example Workflow

1. **Add files to input_files:**
   ```
   input_files/
   ├── photo.png
   ├── video.mp4
   ├── document.pdf
   └── archive.zip
   ```

2. **Run the script:**
   ```bash
   ./auto_process.sh
   ```

3. **Check output:**
   ```
   output/
   └── photo_video_polyglot.mp4
   ```

4. **Test the polyglot:**
   - Copy `photo_video_polyglot.mp4` to `test.ico` → Opens as image
   - Copy `photo_video_polyglot.mp4` to `test.mp4` → Plays as video
   - Copy `photo_video_polyglot.mp4` to `test.pdf` → Opens as PDF
   - Copy `photo_video_polyglot.mp4` to `test.zip` → Extracts as archive

## Troubleshooting

### Common Issues:

1. **"No files found"**
   - Ensure files are in the `input_files` folder
   - Check that files have supported extensions

2. **"Insufficient files for polyglot creation"**
   - You need at least one image AND one video/audio file
   - Add the missing file type(s)

3. **"Failed to create polyglot"**
   - Check that Bun runtime is installed
   - Ensure all dependencies (ffmpeg, ImageMagick, etc.) are available
   - Verify input files are not corrupted

4. **Large output files**
   - Limit appendable files to <200KB for better compatibility
   - Use compressed formats when possible

### Dependencies:
Make sure you have all the beheader dependencies installed **in WSL**:
- [Bun JavaScript runtime](https://bun.sh/) - `curl -fsSL https://bun.sh/install | bash`
- ffmpeg and ffprobe - `sudo apt install ffmpeg`
- ImageMagick's convert - `sudo apt install imagemagick`
- zip and unzip utilities - `sudo apt install zip unzip`
- mp4edit binary (from Bento4) - Available in the Bento4-SDK folder

### WSL Setup:
If you haven't set up WSL yet:
1. Install WSL: `wsl --install` (from Windows PowerShell as admin)
2. Install Ubuntu or your preferred Linux distribution
3. Install the dependencies above in your WSL environment

## Notes

- The processing is not necessarily lossless - files may be re-encoded
- Some programs may show warnings about "bad metadata" - this is normal for polyglots
- Very large files may cause issues - keep appendables under 200KB
- The scripts will automatically handle file type detection and appropriate beheader parameters

## Credits

This automation script is built for the [beheader](https://github.com/p2r3/beheader) polyglot generator created by [@p2r3](https://github.com/p2r3). Beheader is a powerful tool for creating polyglot files that can be interpreted as different file types depending on their extension.

**Original beheader repository:** https://github.com/p2r3/beheader