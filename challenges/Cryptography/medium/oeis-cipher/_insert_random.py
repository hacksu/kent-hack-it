#!/usr/bin/env python3
"""
Script to randomly insert array elements into a text file in order.
Takes a file and an array of elements, then inserts them at random positions
while maintaining the order of the array elements.
"""

import sys
import random
import argparse
import json

def insert_elements_randomly(text, elements):
    """
    Insert elements from the array into the text at random positions,
    maintaining the order of elements in the array.
    
    Args:
        text (str): The original text
        elements (list): List of elements to insert in order
    
    Returns:
        str: Text with elements inserted randomly
    """
    if not elements:
        return text
    
    # Convert text to a list of characters for easier manipulation
    text_chars = list(text)
    
    # Calculate random positions for insertion
    # We need len(elements) positions between 0 and len(text_chars)
    max_pos = len(text_chars)
    
    # Generate random positions and sort them to maintain order
    positions = sorted(random.sample(range(max_pos + 1), min(len(elements), max_pos + 1)))
    
    # If we have more elements than possible positions, space them out
    if len(elements) > len(positions):
        # Create evenly spaced positions
        step = max_pos / len(elements)
        positions = [int(i * step) for i in range(len(elements))]
    
    # Insert elements at the calculated positions (in reverse order to maintain positions)
    result_chars = text_chars[:]
    for i in reversed(range(len(elements))):
        if i < len(positions):
            pos = positions[i] + i  # Adjust position for previous insertions
            result_chars.insert(pos, str(elements[i]))
    
    return ''.join(result_chars)

def parse_array_input(array_input):
    """
    Parse array input from various formats.
    
    Args:
        array_input (str): Array as string (JSON, comma-separated, or space-separated)
    
    Returns:
        list: Parsed array elements
    """
    # Try to parse as JSON first
    try:
        return json.loads(array_input)
    except:
        pass
    
    # Try comma-separated
    if ',' in array_input:
        return [item.strip() for item in array_input.split(',')]
    
    # Try space-separated
    return array_input.split()

def process_file(input_file, elements, output_file=None, seed=None):
    """
    Process the input file and insert elements randomly.
    
    Args:
        input_file (str): Path to the input file
        elements (list): List of elements to insert
        output_file (str): Path to the output file (optional)
        seed (int): Random seed for reproducible results (optional)
    """
    try:
        # Set random seed if provided
        if seed is not None:
            random.seed(seed)
            print(f"Using random seed: {seed}")
        
        # Read the input file
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Insert elements randomly
        processed_content = insert_elements_randomly(content, elements)
        
        # Determine output file name
        if output_file is None:
            # Create output filename by adding '_with_inserts' before the extension
            if '.' in input_file:
                name, ext = input_file.rsplit('.', 1)
                output_file = f"{name}_with_inserts.{ext}"
            else:
                output_file = f"{input_file}_with_inserts"
        
        # Write the processed content
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(processed_content)
        
        print(f"Processed file saved as: {output_file}")
        print(f"Original length: {len(content)} characters")
        print(f"After inserting {len(elements)} elements: {len(processed_content)} characters")
        print(f"Elements inserted: {elements}")
        
    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error processing file: {e}")
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description="Randomly insert array elements into a text file in order",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Insert JSON array
  python insert_random.py input.txt '["a", "b", "c"]'
  
  # Insert comma-separated values
  python insert_random.py input.txt 'そ,さ,し,つ,げ,う'
  
  # Insert space-separated values
  python insert_random.py input.txt 'hello world test'
  
  # With custom output file and seed
  python insert_random.py input.txt '["x", "y", "z"]' -o output.txt -s 42
        """
    )
    
    parser.add_argument('input_file', help='Input text file to process')
    parser.add_argument('elements', help='Array of elements to insert (JSON, comma-separated, or space-separated)')
    parser.add_argument('-o', '--output', help='Output file (optional)')
    parser.add_argument('-s', '--seed', type=int, help='Random seed for reproducible results')
    
    args = parser.parse_args()
    
    # Parse the elements array
    try:
        elements = parse_array_input(args.elements)
    except Exception as e:
        print(f"Error parsing elements array: {e}")
        print("Please provide elements as JSON array, comma-separated, or space-separated values")
        sys.exit(1)
    
    process_file(args.input_file, elements, args.output, args.seed)

if __name__ == "__main__":
    main()
