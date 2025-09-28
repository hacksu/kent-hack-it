#!/usr/bin/env python3

def solitaire_keystream(message_length):
    """
    Generate keystream using Solitaire cipher algorithm
    Starting with bridge order deck as specified in the cipher.txt
    Returns numeric keystream values (1-26)
    """
    
    # Initialize deck in bridge order: clubs, diamonds, hearts, spades, joker gold, joker blue
    # Cards numbered 1-52, Joker A (Gold) = 53, Joker B (Blue) = 54
    deck = list(range(1, 55))  # 1-52 for regular cards, 53=Joker A (Gold), 54=Joker B (Blue)
    
    keystream = []
    keystream_letters = []
    round_num = 0
    
    print("Initial deck (bridge order):")
    print(f"Deck: {deck}")
    print(f"Joker A (Gold) = 53, Joker B (Blue) = 54")
    print("-" * 60)
    
    while len(keystream) < message_length:
        round_num += 1
        print(f"\nRound {round_num}:")
        
        # Step 1: Move Joker A (53) one position down
        joker_a_pos = deck.index(53)
        if joker_a_pos == 53:  # If at bottom, wrap to position 1 (after top card)
            deck.remove(53)
            deck.insert(1, 53)
        else:
            deck.remove(53)
            deck.insert(joker_a_pos + 1, 53)
        
        print(f"After moving Joker A (Gold) one step: Joker A at position {deck.index(53) + 1}")
        
        # Step 2: Move Joker B (54) two positions down  
        joker_b_pos = deck.index(54)
        deck.remove(54)
        new_pos = (joker_b_pos + 2) % 54
        if new_pos == 0:
            new_pos = 1  # Don't put at position 0, put at position 1
        deck.insert(new_pos, 54)
        
        print(f"After moving Joker B (Blue) two steps: Joker B at position {deck.index(54) + 1}")
        
        # Step 3: Triple cut - swap everything above first joker with everything below second joker
        joker_positions = [deck.index(53), deck.index(54)]
        joker_positions.sort()
        first_joker_pos, second_joker_pos = joker_positions
        
        # Perform triple cut
        top_section = deck[:first_joker_pos]
        middle_section = deck[first_joker_pos:second_joker_pos + 1]
        bottom_section = deck[second_joker_pos + 1:]
        
        deck = bottom_section + middle_section + top_section
        print(f"After triple cut: moved {len(top_section)} cards from top to bottom, {len(bottom_section)} from bottom to top")
        
        # Step 4: Count cut using bottom card value
        bottom_card = deck[-1]
        if bottom_card == 54:  # If bottom card is Joker B, use 53
            count = 53
        elif bottom_card == 53:  # If bottom card is Joker A, use 53  
            count = 53
        else:
            count = bottom_card
            
        # Move 'count' cards from top to just above bottom card
        if count < 54:
            cards_to_move = deck[:count]
            remaining_cards = deck[count:-1]
            bottom_card_list = [deck[-1]]
            deck = remaining_cards + cards_to_move + bottom_card_list
            
        print(f"After count cut with bottom card {bottom_card}: moved {count} cards")
        
        # Step 5: Find output card
        top_card = deck[0]
        if top_card == 54:  # If top card is Joker B, use 53
            count_value = 53
        elif top_card == 53:  # If top card is Joker A, use 53
            count_value = 53  
        else:
            count_value = top_card
            
        output_card = deck[count_value]
        
        # Convert to numeric value (skip if joker)
        if output_card in [53, 54]:
            print(f"Output card is joker ({output_card}), skipping this round")
            continue
            
        # Convert card number to numeric keystream value (1-26)
        if output_card <= 26:
            keystream_value = output_card
            keystream_letter = chr(ord('A') + output_card - 1)
        else:
            keystream_value = output_card - 26
            keystream_letter = chr(ord('A') + output_card - 27)
            
        keystream.append(keystream_value)
        keystream_letters.append(keystream_letter)
        print(f"Output card: {output_card} -> Numeric value: {keystream_value} -> Letter: {keystream_letter}")
        print(f"Numeric keystream so far: {keystream}")
        print(f"Letter keystream so far: {''.join(keystream_letters)}")
    
    return keystream, keystream_letters

def encrypt_message(plaintext, keystream_values):
    """Encrypt using Wikipedia specification: A=1, B=2, ..., Z=26"""
    ciphertext = []
    
    for i, plain_char in enumerate(plaintext):
        if i >= len(keystream_values):
            break
            
        # Convert to A=1 system
        plain_num = ord(plain_char) - ord('A') + 1  # A=1, B=2, etc.
        key_num = keystream_values[i]  # Already 1-26
        
        # Add keystream to plaintext
        cipher_num = plain_num + key_num
        # Subtract 26 if result > 26
        if cipher_num > 26:
            cipher_num -= 26
        
        # Convert back to letter
        cipher_char = chr(cipher_num - 1 + ord('A'))
        ciphertext.append(cipher_char)
        
    return ''.join(ciphertext)

def decrypt_message(ciphertext, keystream_values):
    """Decrypt using Wikipedia specification: A=1, B=2, ..., Z=26"""
    plaintext = []
    
    for i, cipher_char in enumerate(ciphertext):
        if i >= len(keystream_values):
            break
            
        # Convert to A=1 system
        cipher_num = ord(cipher_char) - ord('A') + 1  # A=1, B=2, etc.
        key_num = keystream_values[i]  # Already 1-26
        
        # Subtract keystream from ciphertext
        plain_num = cipher_num - key_num
        # Add 26 if result < 1
        if plain_num < 1:
            plain_num += 26
        
        # Convert back to letter
        plain_char = chr(plain_num - 1 + ord('A'))
        plaintext.append(plain_char)
        
    return ''.join(plaintext)

def clean_text(text):
    """Clean text to contain only uppercase letters"""
    return ''.join(char.upper() for char in text if char.isalpha())

if __name__ == "__main__":
    # The desired plaintext for the flag
    desired_plaintext = "DECKOFTHEGOLDENFLASH"
    print(f"Desired plaintext: {desired_plaintext}")
    
    # Generate keystream for this plaintext
    keystream_numeric, keystream_letters = solitaire_keystream(len(desired_plaintext))
    
    print(f"\nKeystream generation:")
    print(f"Numeric keystream: {keystream_numeric}")
    print(f"Letter keystream:  {''.join(keystream_letters)}")
    
    # Encrypt the desired plaintext to get the required ciphertext
    required_ciphertext = encrypt_message(desired_plaintext, keystream_numeric)
    print(f"\nEncryption result:")
    print(f"Plaintext:      {desired_plaintext}")
    print(f"Required cipher: {required_ciphertext}")
    
    # Verify by decrypting the result
    verification = decrypt_message(required_ciphertext, keystream_numeric)
    print(f"Verification:    {verification}")
    print(f"Matches original: {verification == desired_plaintext}")
    
    # Compare with the challenge cipher
    challenge_cipher = "HBMIWELNINIYWMDAGSQR"
    print(f"\nComparison:")
    print(f"Challenge cipher:  {challenge_cipher}")
    print(f"Required cipher:   {required_ciphertext}")
    print(f"Same length:       {len(challenge_cipher) == len(required_ciphertext)}")
    print(f"Ciphers match:     {challenge_cipher == required_ciphertext}")
    
    # Format for flag
    formatted_flag = "deck_of_the_golden_flash"
    print(f"\nFlag format: khi{{{formatted_flag}}}")
    