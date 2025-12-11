# The Golden Flashes' War Cipher
* **Description** During Kent State's early years, a secret society of students called the "Golden Guard" used military-grade encryption to protect their communications. They adopted a cipher used by German forces in World War I, modified with their own keys. NOTE: You will have to wrap and add underscores to the flag formatted like [khi]{[decrypted_text]}.
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Hard
* **Flag:** khi{congratulations_you_are_awaken}


\/ \/ \/ wrong-ish \/ \/ \/
## Steps

## Steps
### Step 1: Identify the Cipher Type
Recognize that this is an [ADFGX cipher](https://en.wikipedia.org/wiki/ADFGVX_cipher), which uses only the letters A, D, F, G, and X in a grid pattern. It combines substitution (using a 5×5 Polybius square) and transposition (columnar rearrangement).

### Step 2: Understand the Cipher Structure
The cipher works in two stages:
1. **Substitution**: Each letter is converted to coordinates in a 5×5 grid labeled with ADFGX.
2. **Transposition**: The resulting pairs are rearranged in columns according to a keyword.

### Step 3: Analyze the Cipher Text
Examine the encrypted message in `cipher.txt`. It is arranged in a grid. For the following steps, work with the grid as presented (no rotation). Rotation is optional and only for visualization.

### Step 4: Find and Prepare the Keyword Line (Result in `_fixed_cipher.txt`)
Look for the line that contains the keyword (likely Kent State-related, e.g., KENT, FLASH, GOLDEN, STATE) in your working cipher text. After you perform the rearrangement described in Step 5, the result should match the contents of `_fixed_cipher.txt`, which contains the correctly rearranged cipher text for decryption.

### Step 5: Rearrange the Keyword Line
Split the line at the keyword: take one half (before or after the keyword, as required by the puzzle) and move it to the other side. This restores the order needed for decryption.

### Step 6: Prepare for Decryption
If you used rotation for visualization, you may rotate it back to match the standard ADFGX cipher grid, but this is not required. After rearranging the keyword line, the correctly rearranged cipher text will be in `_fixed_cipher.txt`. Use this file for the remaining decryption steps.

### Step 7: Determine the Keyword and Polybius Square
For ADFGX decryption, you need:
- **Keyword**: Used for columnar transposition (likely Kent State-related)
- **Alphabet square**: 5×5 grid arrangement of letters (often scrambled using a keyword; I/J are combined)

### Step 8: Reverse the Transposition
Using the keyword, reverse the columnar transposition:
1. Arrange the cipher text in columns according to the keyword length.
2. Reorder columns based on alphabetical order of keyword letters.
3. Read out the ADFGX coordinate pairs row by row.

### Step 9: Reverse the Substitution
Convert the ADFGX coordinate pairs back to letters using the 5×5 alphabet grid:
1. Each pair of letters represents row/column coordinates.
2. Find the intersection in the alphabet square to get the original letter.
3. Combine all letters to form the plaintext message.

### Step 10: Use Specialized Tools (Optional)
Due to the complexity of ADFGX ciphers, consider using online tools:
- [dCode ADFGX Cipher](https://www.dcode.fr/adfgx-cipher)
- [CrypTool](https://www.cryptool.org/)
- Manual calculation with trial keywords

### Step 11: Extract the Final Flag
The decrypted message reveals: `congratulationsyouareawaken`
Format according to challenge requirements: `khi{congratulations_you_are_awaken}`
