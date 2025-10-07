#!/usr/bin/env python3
"""
Generate hiragana characters for OEIS cipher encoding.
This script takes a message and generates the corresponding hiragana characters
that will decode to that message using the OEIS A000788 sequence.
"""

def generate_oeis_a000788(max_n):
    """Generate OEIS sequence A000788: total number of 1's in binary expansions of 0, 1, ..., n"""
    sequence = [0]  # A000788(0) = 0
    
    for n in range(1, max_n + 1):
        total_ones = sequence[n-1] + bin(n).count('1')
        sequence.append(total_ones)
    
    return sequence

def encode_message_to_hiragana(message):
    """
    Encode a message to hiragana characters using OEIS A000788.
    
    Args:
        message (str): Message to encode (letters only)
    
    Returns:
        list: List of hiragana characters
    """
    # Generate OEIS sequence
    oeis_sequence = generate_oeis_a000788(200)
    
    hiragana_chars = []
    hiragana_offset = 0x3042  # Base hiragana Unicode offset
    
    for char in message.lower():
        if not char.isalpha():
            continue
            
        # Convert letter to position (a=0, b=1, etc.)
        pos = ord(char) - ord('a')
        
        # Calculate encoded value: position + OEIS[position]
        if pos < len(oeis_sequence):
            encoded_value = pos + oeis_sequence[pos]
            
            # Convert to hiragana Unicode
            hiragana_unicode = encoded_value + hiragana_offset
            hiragana_char = chr(hiragana_unicode)
            
            hiragana_chars.append(hiragana_char)
            print(f"'{char}' (pos {pos}) + OEIS[{pos}]({oeis_sequence[pos]}) = {encoded_value} -> '{hiragana_char}'")
        else:
            print(f"Error: Position {pos} exceeds OEIS sequence length")
    
    return hiragana_chars

def main():
    # The new message to encode
    message = "khi{magic_under_kent}"
    
    print(f"Encoding message: {message}")
    print("=" * 50)
    
    # Generate hiragana characters
    hiragana_chars = encode_message_to_hiragana(message)
    
    print("\nGenerated hiragana characters:")
    print(", ".join(hiragana_chars))
    
    print("\nAs a continuous string:")
    print("".join(hiragana_chars))
    
    print(f"\nTotal characters: {len(hiragana_chars)}")

if __name__ == "__main__":
    main()