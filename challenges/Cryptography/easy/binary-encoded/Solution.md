# Bits of Blue & Gold
* **Description** Hidden in a stream of ones and zeros, the Flashes’ code awaits.
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Easy
* **Flag:** khi{Black_Squirrel}

## Steps
#### Step 1
Recognize that the sequence of 1s and 0s represents binary encoding. Each group of 8 bits (binary digits) represents one ASCII character.

#### Step 2
Split the binary string into 8-bit chunks:
- `01101011` = 107 (decimal) = 'k'
- `01101000` = 104 (decimal) = 'h' 
- `01101001` = 105 (decimal) = 'i'
- Continue for each 8-bit group...

#### Step 3
Use an online binary-to-text converter or manually convert each 8-bit binary number to its decimal ASCII value, then to the corresponding character.

#### Step 4
The complete binary sequence decodes to: `khi{Black_Squirrel}`
