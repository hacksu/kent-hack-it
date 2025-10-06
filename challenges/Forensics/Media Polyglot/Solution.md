# Flash's Media Hunt
* **Description:**  
* **Event:** Kent Hack It 2025
* **Category:** Forensic
* **Difficulty:** Medium
* **Flag:** khi{0_free_volleyball_data}

## Steps
#### Step 1: Understand the Challenge
The description indicates this is a polyglot file containing hidden data fragments across multiple embedded media formats. Extract pieces from each format and assemble them in the correct order.

#### Step 2: Identify Embedded Formats
Use `binwalk`, `file` command, or hex analysis to identify the different media formats embedded within the polyglot file. Look for file headers indicating PNG, PDF, HTML, MP4, and ZIP formats.

#### Step 3: Extract Media Files
Use `binwalk`, `foremost`, or manual extraction to separate the file formats:
- PDF file
- HTML file
- PNG image
- MP4 video
- ZIP file

#### Step 4: Find Ordering Instructions
Extract and read the ZIP file to find the ordering instructions and determine the correct sequence of flag pieces.

#### Step 5: Extract Hidden Data
Each file contains a flag piece:
- **PDF**: "0" (How many wins did the football team get?)
- **HTML**: "free" (What is the price of this activity?)
- **PNG**: "volleyball" (What is Flash holding?)
- **MP4**: "data" (What is the dashboard collecting?)

#### Step 6: Assemble the Flag
Combine the pieces in order, separated by underscores: `khi{0_free_volleyball_data}`
