# Golden Flash Cards
* **Description** A Golden Flash operative left behind only a deck of cards and an encrypted message from their mission to protect Kent State secrets. The cards seem ordinary, but perhaps they hold the key to decoding the message. After all, what's more inconspicuous on a college campus than students playing cards? NOTE: the decryption message has to be formatted with underscores, lowercased, and wrapped in khi{[decrypted_text]}
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Hard
* **Points:** ?
* **Flag:** khi{deck_of_the_golden_flash}

## Steps
#### Step 1
Research card-based encryption methods. This challenge uses the [Solitaire cipher](https://en.wikipedia.org/wiki/Solitaire_%28cipher%29) that was designed for manual calculation using only playing cards.

#### Step 2
Set up the initial deck configuration as found in the Kent Student Center. The deck uses Kent State themed values in bridge order:
- Clubs     (♣):  1-13
- Diamonds  (♦):  14-26  
- Hearts    (♥):  27-39
- Spades    (♠):  40-52
- Joker     Gold: 53 (Joker A)
- Joker     Blue: 54 (Joker B)

Start with a factory-fresh deck in standard bridge order: [1, 2, 3, ..., 52, 53, 54]

#### Step 3
The challenge provides ciphertext: `HBMIWELNINIYWMDAGSQR`
Convert each letter to numbers using A=1 system (A=1, B=2, C=3, ..., Z=26).

#### Step 4
Generate keystream values using the Solitaire algorithm starting with the bridge-order deck. For each character needed, perform these steps:

1. **Move Joker A (53)**: Move it one position down (wraps to position 2 if at bottom)
2. **Move Joker B (54)**: Move it two positions down (can wrap to position 2 or 3, never 1)
3. **Triple Cut**: Swap cards above first joker with cards below second joker
4. **Count Cut**: Use bottom card value (53 for jokers) to move that many cards from top to just above bottom card
5. **Generate Value**: Use top card value (53 for jokers) to count into deck for keystream value

With proper implementation, the keystream is: `[4, 23, 10, 24, 8, 25, 18, 6, 4, 7, 20, 13, 19, 8, 16, 21, 21, 18, 24, 10]`

#### Step 5
Decrypt using the formula: `plaintext_value = ciphertext_value - keystream_value` (add 26 if result < 1)

Examples:
- H(8) - 4 = 4 = D
- B(2) - 23 = -21 → -21 + 26 = 5 = E  
- M(13) - 10 = 3 = C
- I(9) - 24 = -15 → -15 + 26 = 11 = K
- W(23) - 8 = 15 = O

#### Step 6
The complete decryption reveals: `DECKOFTHEGOLDENFLASH`
Format as required: `khi{deck_of_the_golden_flash}`
