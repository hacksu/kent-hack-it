# The Golden Flashes' War Cipher
* **Description** During Kent State's early years, a secret society of students called the "Golden Guard" used military-grade encryption to protect their communications. They adopted a cipher used by German forces in World War I, modified with their own keys. NOTE: You will have to wrap and add underscores to the flag formatted like [khi]{[decrypted_text]}.
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Medium
* **Flag:** khi{congratulations_you_are_awaken}

## Steps
#### Step 1: Identify the Cipher Type
Recognize that this is an [ADFGX cipher](https://en.wikipedia.org/wiki/ADFGVX_cipher), a field cipher used by the German Army during World War I. The cipher uses only the letters A, D, F, G, and X arranged in a grid pattern. This cipher combines substitution (using a 5×5 Polybius square) with transposition (columnar rearrangement).

#### Step 2: Understand the ADFGX Structure
The ADFGX cipher works in two stages:
1. **Substitution**: Each letter is converted to coordinates in a 5×5 grid using A, D, F, G, X as row/column headers
2. **Transposition**: The resulting pairs are arranged in columns and rearranged according to a keyword

The cipher uses a 5×5 alphabet grid (combining I/J) labeled with ADFGX coordinates.

#### Step 3: Analyze the Cipher Text Format
Examine the encrypted message in `cipher.txt`. Notice it's arranged in a grid format with 5 columns and 13 rows, all using only the letters A, D, F, G, X. This suggests the transposition stage has already been applied.

#### Step 4: Determine the Keyword and Grid
For ADFGX decryption, you need:
- **Keyword**: Used for columnar transposition (likely Kent State-related)
- **Alphabet square**: 5×5 grid arrangement of letters

Common keywords might be: KENT, FLASH, GOLDEN, STATE, or other university-related terms. The alphabet square often uses a keyword to scramble the standard A-Z arrangement.

#### Step 5: Apply Reverse Transposition
Using the keyword, reverse the columnar transposition:
1. Arrange the cipher text in columns according to the keyword length
2. Reorder columns based on alphabetical order of keyword letters
3. Read out the ADFGX coordinate pairs row by row

#### Step 6: Apply Reverse Substitution
Convert the ADFGX coordinate pairs back to letters using the 5×5 alphabet grid:
1. Each pair of letters represents row/column coordinates
2. Find the intersection in the alphabet square to get the original letter
3. Combine all letters to form the plaintext message

#### Step 7: Use Specialized Tools
Due to the complexity of ADFGX ciphers, consider using online tools:
- [dCode ADFGX Cipher](https://www.dcode.fr/adfgx-cipher)
- [CrypTool](https://www.cryptool.org/) 
- Manual calculation with trial keywords

#### Step 8: Extract the Final Flag
The decrypted message reveals: `congratulationsyouareawaken`
Format according to challenge requirements: `khi{congratulations_you_are_awaken}`
