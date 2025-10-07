#!/usr/bin/env python3
"""
Script to remove all English characters from a text file.
Keeps only non-English characters (like Japanese, special symbols, etc.)
"""

import sys
import re
import argparse

def remove_english_chars(text):
    """
    Remove all English alphabetic characters, spaces, and punctuation from the text.
    Keeps only numbers and non-English characters.
    """
    # Remove English alphabetic characters, spaces, and common punctuation
    return re.sub(r'[a-zA-Z0-9\s.,!?;:\'"\-\(\)\[\]\{\}<>/\\&@#$%^*+=_|`~]', '', text)

def process_file(input_file, output_file=None):
    """
    Process the input file and remove English characters.
    
    Args:
        input_file (str): Path to the input file
        output_file (str): Path to the output file (optional)
    """
    try:
        # Read the input file
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove English characters
        processed_content = remove_english_chars(content)
        
        # Determine output file name
        if output_file is None:
            # Create output filename by adding '_no_english' before the extension
            if '.' in input_file:
                name, ext = input_file.rsplit('.', 1)
                output_file = f"{name}_no_english.{ext}"
            else:
                output_file = f"{input_file}_no_english"
        
        # Write the processed content
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(processed_content)
        
        print(f"Processed file saved as: {output_file}")
        print(f"Original length: {len(content)} characters")
        print(f"After removing English chars: {len(processed_content)} characters")
        print(f"Removed {len(content) - len(processed_content)} English characters")
        
    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error processing file: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description="Remove all English characters from a text file",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python remove_english_chars.py input.txt
  python remove_english_chars.py input.txt -o output.txt
  python remove_english_chars.py enhanced_story.txt
        """
    )
    
    parser.add_argument('input_file', help='Input text file to process')
    parser.add_argument('-o', '--output', help='Output file (optional)')
    
    args = parser.parse_args()
    
    process_file(args.input_file, args.output)

if __name__ == "__main__":
    main()