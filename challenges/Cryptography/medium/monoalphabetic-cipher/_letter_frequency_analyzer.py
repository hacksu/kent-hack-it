#!/usr/bin/env python3
"""
Letter Frequency Analyzer
Reads a text file and outputs the frequency of each letter in the alphabet.
"""

import sys
import os
from collections import Counter
import argparse

def analyze_letter_frequency(text):
    """
    Analyze the frequency of letters in the given text.
    
    Args:
        text (str): The text to analyze
        
    Returns:
        dict: Dictionary with letter frequencies as percentages
    """
    # Convert to lowercase and keep only alphabetic characters
    letters_only = ''.join(char.lower() for char in text if char.isalpha())
    
    if not letters_only:
        return {}
    
    # Count letter frequencies
    letter_counts = Counter(letters_only)
    total_letters = len(letters_only)
    
    # Calculate percentages
    letter_frequencies = {}
    for letter in 'abcdefghijklmnopqrstuvwxyz':
        count = letter_counts.get(letter, 0)
        frequency = (count / total_letters) * 100
        letter_frequencies[letter] = {
            'count': count,
            'frequency': frequency
        }
    
    return letter_frequencies, total_letters

def display_frequencies(letter_frequencies, total_letters, sort_by_frequency=True):
    """
    Display the letter frequencies in a formatted table.
    
    Args:
        letter_frequencies (dict): Dictionary with letter frequency data
        total_letters (int): Total number of letters analyzed
        sort_by_frequency (bool): Whether to sort by frequency (descending) or alphabetically
    """
    print(f"Letter Frequency Analysis")
    print(f"Total letters analyzed: {total_letters:,}")
    print("=" * 50)
    print(f"{'Letter':<8} {'Count':<8} {'Frequency':<12} {'Bar Chart'}")
    print("-" * 50)
    
    # Sort the data
    if sort_by_frequency:
        sorted_items = sorted(letter_frequencies.items(), 
                            key=lambda x: x[1]['frequency'], 
                            reverse=True)
    else:
        sorted_items = sorted(letter_frequencies.items())
    
    # Find max frequency for scaling the bar chart
    max_frequency = max(data['frequency'] for data in letter_frequencies.values()) if letter_frequencies else 0
    
    for letter, data in sorted_items:
        count = data['count']
        frequency = data['frequency']
        
        # Create a simple bar chart (scale to 30 characters max)
        if max_frequency > 0:
            bar_length = int((frequency / max_frequency) * 30)
            bar = '█' * bar_length
        else:
            bar = ''
        
        print(f"{letter.upper():<8} {count:<8} {frequency:<12.3f}% {bar}")

def check_frequency_order(letter_frequencies):
    """
    Check if the letter frequency order matches expected patterns.
    """
    # Standard English letter frequency order (from most to least common)
    expected_order = 'etaoinshrdlcumwfgypbvkjxqz'
    
    # Get actual order from the text
    actual_order = ''.join([letter for letter, _ in sorted(letter_frequencies.items(), 
                                                          key=lambda x: x[1]['frequency'], 
                                                          reverse=True)])
    
    print("\n" + "=" * 60)
    print("Letter Frequency Order Analysis")
    print("=" * 60)
    print(f"Expected (English): {expected_order.upper()}")
    print(f"Actual   (Your text): {actual_order.upper()}")
    
    # Check top 12 letters (cover ~80% of English text)
    top_12_expected = expected_order[:12]
    top_12_actual = actual_order[:12]
    
    matches_in_top_12 = sum(1 for i in range(12) if top_12_expected[i] == top_12_actual[i])
    top_12_score = (matches_in_top_12 / 12) * 100
    
    print(f"\nTop 12 letters comparison:")
    print(f"Expected: {top_12_expected.upper()}")
    print(f"Actual  : {top_12_actual.upper()}")
    print(f"Exact position matches: {matches_in_top_12}/12 ({top_12_score:.1f}%)")
    
    # Check if top letters appear in top positions (more flexible)
    top_12_letters_in_expected = set(top_12_expected)
    top_12_letters_in_actual = set(top_12_actual)
    common_top_letters = top_12_letters_in_expected.intersection(top_12_letters_in_actual)
    flexibility_score = (len(common_top_letters) / 12) * 100
    
    print(f"Letters appearing in both top 12: {len(common_top_letters)}/12 ({flexibility_score:.1f}%)")
    
    # Check for common patterns
    patterns = {
        'E most common': actual_order[0] == 'e',
        'T in top 3': 't' in actual_order[:3],
        'A in top 5': 'a' in actual_order[:5],
        'ETAOIN in top 6': all(letter in actual_order[:6] for letter in 'etaoin'),
        'Q, X, Z in bottom 5': all(letter in actual_order[-5:] for letter in 'qxz'),
        'Vowels distributed': len([l for l in actual_order[:10] if l in 'aeiou']) >= 3
    }
    
    print(f"\nPattern Analysis:")
    pattern_score = 0
    for pattern_name, pattern_match in patterns.items():
        status = "✓" if pattern_match else "✗"
        print(f"  {status} {pattern_name}")
        if pattern_match:
            pattern_score += 1
    
    pattern_percentage = (pattern_score / len(patterns)) * 100
    print(f"\nPattern match score: {pattern_score}/{len(patterns)} ({pattern_percentage:.1f}%)")
    
    # Overall assessment
    overall_score = (top_12_score + flexibility_score + pattern_percentage) / 3
    print(f"Overall order similarity: {overall_score:.1f}%")
    
    if overall_score >= 80:
        assessment = "Excellent match - likely English text"
    elif overall_score >= 60:
        assessment = "Good match - probably English or similar language"
    elif overall_score >= 40:
        assessment = "Moderate match - could be English with unusual content"
    elif overall_score >= 20:
        assessment = "Poor match - might be cipher, foreign language, or specialized text"
    else:
        assessment = "Very poor match - likely encrypted or non-English text"
    
    print(f"Assessment: {assessment}")
    
    return {
        'expected_order': expected_order,
        'actual_order': actual_order,
        'top_12_score': top_12_score,
        'flexibility_score': flexibility_score,
        'pattern_score': pattern_percentage,
        'overall_score': overall_score,
        'assessment': assessment
    }

def compare_with_english_standard(letter_frequencies):
    """
    Compare the analyzed frequencies with standard English letter frequencies.
    """
    # Standard English letter frequencies (from Wikipedia)
    english_frequencies = {
        'e': 12.702, 't': 9.056, 'a': 8.167, 'o': 7.507, 'i': 6.966,
        'n': 6.749, 's': 6.327, 'h': 6.094, 'r': 5.987, 'd': 4.253,
        'l': 4.025, 'c': 2.782, 'u': 2.758, 'm': 2.406, 'w': 2.360,
        'f': 2.228, 'g': 2.015, 'y': 1.974, 'p': 1.929, 'b': 1.492,
        'v': 0.978, 'k': 0.772, 'j': 0.153, 'x': 0.150, 'q': 0.095,
        'z': 0.074
    }
    
    print("\n" + "=" * 70)
    print("Comparison with Standard English Letter Frequencies")
    print("=" * 70)
    print(f"{'Letter':<8} {'Your Text':<12} {'English Std':<12} {'Difference':<12}")
    print("-" * 70)
    
    total_difference = 0
    for letter in 'etaoinshrdlcumwfgypbvkjxqz':  # Sort by English frequency
        your_freq = letter_frequencies[letter]['frequency']
        std_freq = english_frequencies[letter]
        difference = your_freq - std_freq
        total_difference += abs(difference)
        
        print(f"{letter.upper():<8} {your_freq:<12.3f}% {std_freq:<12.3f}% {difference:<+12.3f}%")
    
    print("-" * 70)
    print(f"Total absolute difference: {total_difference:.3f}%")
    
    # Calculate similarity score (100% - average absolute difference)
    similarity_score = max(0, 100 - (total_difference / 26))
    print(f"Similarity to English: {similarity_score:.1f}%")

def main():
    parser = argparse.ArgumentParser(description='Analyze letter frequency in a text file')
    parser.add_argument('filename', help='Path to the text file to analyze')
    parser.add_argument('-a', '--alphabetical', action='store_true', 
                       help='Sort output alphabetically instead of by frequency')
    parser.add_argument('-c', '--compare', action='store_true',
                       help='Compare with standard English letter frequencies')
    parser.add_argument('-r', '--order-check', action='store_true',
                       help='Check if letter frequency order matches English patterns')
    parser.add_argument('-o', '--output', help='Save results to a file')
    
    args = parser.parse_args()
    
    # Check if file exists
    if not os.path.exists(args.filename):
        print(f"Error: File '{args.filename}' not found.")
        sys.exit(1)
    
    try:
        # Read the file
        with open(args.filename, 'r', encoding='utf-8', errors='ignore') as file:
            text = file.read()
        
        if not text.strip():
            print("Error: File is empty or contains no text.")
            sys.exit(1)
        
        # Analyze frequencies
        letter_frequencies, total_letters = analyze_letter_frequency(text)
        
        if not letter_frequencies:
            print("Error: No alphabetic characters found in the file.")
            sys.exit(1)
        
        # Prepare output
        output_lines = []
        
        # Capture print output if saving to file
        if args.output:
            import io
            from contextlib import redirect_stdout
            
            string_buffer = io.StringIO()
            with redirect_stdout(string_buffer):
                display_frequencies(letter_frequencies, total_letters, 
                                  not args.alphabetical)
                if args.compare:
                    compare_with_english_standard(letter_frequencies)
                if args.order_check:
                    check_frequency_order(letter_frequencies)
            
            output_content = string_buffer.getvalue()
            
            # Save to file
            with open(args.output, 'w', encoding='utf-8') as output_file:
                output_file.write(f"Letter Frequency Analysis of: {args.filename}\n")
                output_file.write("=" * 50 + "\n\n")
                output_file.write(output_content)
            
            print(f"Results saved to: {args.output}")
        
        # Display results
        display_frequencies(letter_frequencies, total_letters, not args.alphabetical)
        
        if args.compare:
            compare_with_english_standard(letter_frequencies)
            
        if args.order_check:
            check_frequency_order(letter_frequencies)
            
    except Exception as e:
        print(f"Error reading file: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # If no command line arguments, provide interactive mode
    if len(sys.argv) == 1:
        print("Letter Frequency Analyzer")
        print("=" * 30)
        # filename = '.\\challenges\\Cryptography\\medium\monoalphabetic-cipher\\_frequency_matched_text.txt'
        filename = '.\\challenges\\Cryptography\\medium\monoalphabetic-cipher\\_frequency_matched_text_w_flag.txt'
        
        if not filename:
            print("No filename provided. Exiting.")
            sys.exit(1)
        
        if not os.path.exists(filename):
            print(f"Error: File '{filename}' not found.")
            sys.exit(1)
        
        try:
            with open(filename, 'r', encoding='utf-8', errors='ignore') as file:
                text = file.read()
            
            letter_frequencies, total_letters = analyze_letter_frequency(text)
            
            if not letter_frequencies:
                print("Error: No alphabetic characters found in the file.")
                sys.exit(1)
            
            display_frequencies(letter_frequencies, total_letters, True)
            
            compare_choice = input("\nWould you like to compare with English standard frequencies? (y/n): ").lower().strip()
            if compare_choice in ['y', 'yes']:
                compare_with_english_standard(letter_frequencies)
                
            order_choice = input("\nWould you like to check the frequency order patterns? (y/n): ").lower().strip()
            if order_choice in ['y', 'yes']:
                check_frequency_order(letter_frequencies)
                
        except Exception as e:
            print(f"Error: {e}")
            sys.exit(1)
    else:
        main()