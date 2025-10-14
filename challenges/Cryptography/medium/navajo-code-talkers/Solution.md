
# Golden Flashes Code Talk
* **Description** Echoing Kent State’s innovative spirit and the voices of those who once spoke in code. Each mark carries meaning, yet layers of transformation conceal the truth beneath. NOTE: The decryption message has to be formatted with underscores, lowercased, and wrapped in khi{[decrypted_text]}.
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Medium
* **Flag:** khi{walkie_talkie_certified}

## Steps
### Step 1: Recognize the Cipher Theme
Notice the challenge references Navajo Code Talkers, a famous group of WWII cryptographers. The provided script uses a mapping of letters to Navajo words, with Kent State flair.

### Step 2: Understand the Encoding Process
Each letter in the plaintext is substituted with a random Navajo word from a predefined map. Each word is then hex-encoded and split into 4-byte (8 hex char) chunks, separated by spaces. Each word is separated by '|'.

Example: 'K' might become 'JAD-HO-LONI', hexed as '4a41442d484f2d4c 4f4e49'.

### Step 3: Decode the Hexed Navajo Words
To decrypt, split the encoded string by '|', then for each chunk, join the hex segments and decode from hex to get the Navajo word. Use the provided map to reverse each word back to its corresponding letter.

### Step 4: Reconstruct the Plaintext
After mapping all Navajo words back to their letters, reconstruct the original message. Format the answer as required: all lowercase, underscores for spaces, and wrapped in 'khi{...}'.

### Step 5: Submit the Flag
The final flag is: `khi{walkie_talkie_certified}`
