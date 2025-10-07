#!/usr/bin/env python3
"""
OEIS Cipher Solver
Solves the Golden Flashes' Code challenge using OEIS sequence A000788.

This script takes a list of Japanese hiragana characters and decodes them
by converting to Unicode values, applying the OEIS transformation, and
converting back to English letters.
"""

import sys
import argparse

def generate_oeis_a000788(max_n):
    """
    Generate OEIS sequence A000788: total number of 1's in binary expansions of 0, 1, ..., n
    
    Args:
        max_n (int): Maximum value to generate sequence up to
    
    Returns:
        list: OEIS A000788 sequence values
    """
    sequence = [0]  # A000788(0) = 0
    
    for n in range(1, max_n + 1):
        # Count total 1's in binary representations from 0 to n
        total_ones = sequence[n-1] + bin(n).count('1')
        sequence.append(total_ones)
    
    return sequence

def hiragana_to_unicode_offset(char):
    """
    Convert hiragana character to Unicode offset value.
    
    Args:
        char (str): Hiragana character
    
    Returns:
        int: Unicode value minus hiragana offset (0x3042 = 12354)
    """
    unicode_val = ord(char)
    offset = 0x3042  # 12354 - base hiragana offset
    return unicode_val - offset

def solve_oeis_cipher(hiragana_chars):
    """
    Solve the OEIS cipher by decoding hiragana characters.
    
    Args:
        hiragana_chars (list): List of hiragana characters in order
    
    Returns:
        str: Decoded message
    """
    # Generate OEIS sequence A000788 (we need enough values - increased range)
    oeis_sequence = generate_oeis_a000788(200)
    
    decoded_chars = []
    
    for i, char in enumerate(hiragana_chars):
        # Convert hiragana to encoded value
        encoded_value = hiragana_to_unicode_offset(char)
        
        print(f"Character {i+1}: '{char}' -> Unicode {ord(char)} -> Encoded {encoded_value}")
        
        # Find the alphabet position where position + OEIS[position] = encoded_value
        found = False
        # Extended search range to handle larger encoded values
        for pos in range(100):  # Extended range
            if pos < len(oeis_sequence) and pos + oeis_sequence[pos] == encoded_value:
                # Convert position to letter (0-25 for a-z, handle larger values)
                if pos < 26:
                    letter = chr(ord('a') + pos)
                else:
                    # For positions > 25, map back to alphabet cyclically or use different mapping
                    letter = chr(ord('a') + (pos % 26))
                decoded_chars.append(letter)
                print(f"  Position {pos} + OEIS[{pos}]({oeis_sequence[pos]}) = {pos + oeis_sequence[pos]} -> '{letter}'")
                found = True
                break
        
        if not found:
            print(f"  Warning: Could not decode character '{char}' (encoded value: {encoded_value})")
            # Try alternative approach - maybe the mapping is different
            print(f"    Searching for alternative mappings...")
            for pos in range(26):
                if pos < len(oeis_sequence):
                    calculated = pos + oeis_sequence[pos]
                    print(f"    pos {pos}: {pos} + {oeis_sequence[pos]} = {calculated}")
            decoded_chars.append('?')
    
    return ''.join(decoded_chars)

def parse_hiragana_input(input_str):
    """
    Parse hiragana characters from input string.
    
    Args:
        input_str (str): Input string containing hiragana characters
    
    Returns:
        list: List of hiragana characters
    """
    # Remove spaces and split by commas if present
    if ',' in input_str:
        chars = [char.strip() for char in input_str.split(',')]
    else:
        # Extract individual characters
        chars = [char for char in input_str if char.strip()]
    
    return chars

def main():
    parser = argparse.ArgumentParser(
        description="Solve OEIS cipher challenge using hiragana characters",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # From comma-separated string
  python solve_oeis_cipher.py "そ,さ,し,つ,げ,し,う,ま,と,い,ぴ,そ,か,と,ほ"
  
  # From space-separated string
  python solve_oeis_cipher.py "そ さ し つ げ し う ま と い ぴ そ か と ほ"
  
  # From continuous string
  python solve_oeis_cipher.py "そさしつげしうまといぴそかとほ"
  
  # Interactive mode
  python solve_oeis_cipher.py
        """
    )
    
    parser.add_argument('characters', nargs='?', help='Hiragana characters to decode (comma/space separated or continuous)')
    parser.add_argument('--format-flag', action='store_true', help='Format output as khi{result}')
    
    args = parser.parse_args()
    
    # Get hiragana characters
    if args.characters:
        hiragana_chars = parse_hiragana_input(args.characters)
    else:
        # Interactive mode
        print("Enter hiragana characters (comma-separated, space-separated, or continuous):")
        user_input = input("> ")
        hiragana_chars = parse_hiragana_input(user_input)
    
    if not hiragana_chars:
        print("Error: No hiragana characters provided.")
        sys.exit(1)
    
    print(f"\nDecoding {len(hiragana_chars)} hiragana characters...")
    print(f"Characters: {hiragana_chars}")
    print("\nDecoding process:")
    
    # Solve the cipher
    decoded_message = solve_oeis_cipher(hiragana_chars)
    
    print(f"\nDecoded message: {decoded_message}")
    
    if args.format_flag:
        flag = f"khi{{{decoded_message}}}"
        print(f"Formatted flag: {flag}")
    else:
        print("Use --format-flag to format as khi{result}")

if __name__ == "__main__":
    main()