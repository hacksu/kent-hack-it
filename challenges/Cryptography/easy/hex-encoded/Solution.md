# Hex in the Halls
* **Description** A secret lies in the halls of Kent State.
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Easy
* **Flag:** khi{Flashes_To_Glory}

## Steps
#### Step 1
Recognize that the spaced numbers and letters represent hexadecimal encoding. Hexadecimal uses base-16 with digits 0-9 and letters A-F.

#### Step 2
The format `6B 68 69 7B 46 6C 61 73 68 65 73 5F 54 6F 5F 47 6C 6F 72 79 7D` shows hex bytes separated by spaces.

#### Step 3
Convert each hex pair to its ASCII character:
- `6B` = 107 (decimal) = 'k'
- `68` = 104 (decimal) = 'h'
- `69` = 105 (decimal) = 'i'
- `7B` = 123 (decimal) = '{'
- Continue for all hex pairs...

#### Step 4
Use an online hex-to-text converter or manually decode each pair to reveal: `khi{Flashes_To_Glory}`
