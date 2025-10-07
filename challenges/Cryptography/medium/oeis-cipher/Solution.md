# The Golden Flashes' Hidden Legend
* **Description:** An ancient story about Kent State has been discovered, but something seems off... what are these strange characters scattered throughout the text? Can you uncover the flag by decoding these symbols with the help of mathematical sequences? NOTE: You will have to wrap and add underscores to the flag formatted like [khi]{[decrypted_text]}.
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Medium
* **Flag:** khi{magic_under_kent}

## Steps
#### Step 1: Examine the Story File
Look at the main story file (`story.txt`) about Kent State's Golden Flashes' Legacy. You'll notice that scattered throughout the English text are Japanese hiragana characters that seem out of place. These characters appear embedded within English words or between words.

#### Step 2: Extract the Hidden Characters  
Extract all the Japanese hiragana characters from the story in the order they appear. You should find 17 characters total: そ, さ, し, つ, あ, け, し, う, む, と, ぉ, か, ぶ, そ, か, と, ぽ. These characters are the encoded message. You can do this manually by going through the text, or by writing a script to extract non-ASCII characters.

#### Step 3: Determine the Encoding Method
You need to figure out how the hiragana characters are encoded. This can be done through analysis or by using the optional hint files if you need help:
- **Optional hint**: `hint1.txt` contains the Unicode offset: `0x3042` (this is the base offset for hiragana characters)
- **Optional hint**: `hint2.txt` contains the mathematical sequence: `A000788` (this refers to an OEIS sequence)

Through analysis, you should discover that:
- The hiragana characters use Unicode offset 0x3042 (12354 in decimal)
- The encoding involves OEIS sequence A000788

#### Step 4: Research OEIS A000788
Look up OEIS sequence A000788 on https://oeis.org/. This sequence represents "Total number of 1's in binary expansions of 0, 1, ..., n". The first few values are: 0, 1, 2, 4, 5, 7, 9, 12, 13, 15, 17, 20, 22, 25, 27, 30, 31, 33, 35, 38, 40, 43, 45, 48, 50, 53...

#### Step 5: Decode the Characters
For each hiragana character:
1. Convert to Unicode decimal value
2. Subtract the offset (0x3042 = 12354) to get the encoded value
3. Find which alphabet position (0-25 for a-z) when added to its corresponding OEIS A000788 value equals the encoded value
4. Use the formula: `position + OEIS[position] = encoded_value`
5. Convert the position back to its corresponding letter (0=a, 1=b, ..., 25=z)

For example:
- Character 'そ' (Unicode 12381) → Encoded value: 12381 - 12354 = 27
- Find position where: position + OEIS[position] = 27
- Position 10 + OEIS[10] (17) = 27 → Letter 'k'

#### Step 6: Assemble the Flag
The decoded letters spell out: `khimagicunderkent`
Format it according to the challenge requirements by separating into words and adding underscores: `khi{magic_under_kent}`
