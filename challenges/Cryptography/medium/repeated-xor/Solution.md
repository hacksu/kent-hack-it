# Flash Pattern
* **Description** The Flashes encoded their secret using a repeating electrical operation. You'll need to find the right binary technique and key to reveal their message.
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Medium
* **Flag:** khi{FlashBytes_1910}

## Steps
#### Step 1: Identify the Cipher Type
Recognize that this is a repeated XOR cipher. In XOR encryption, the plaintext is XORed with a key that repeats throughout the message.

#### Step 2: Convert Hex to Workable Format
The cipher text `0c07051f21030d170f2d1510021c33555e5e5c19` is in hexadecimal format. Convert this to bytes for easier manipulation.

#### Step 3: Find the XOR Key Using Known Plaintext
Since we know all flags start with `khi{`, we can use this to find the XOR key:
- `khi{` in hex is `6b68697b`
- XOR this with the first 4 bytes of the cipher: `0c07051f`
- First 4 bytes: `0c07051f`
- Key calculation:
  - `0c` XOR `6b` = `67` ('g')
  - `07` XOR `68` = `6f` ('o')  
  - `05` XOR `69` = `6c` ('l')
  - `1f` XOR `7b` = `64` ('d')
- Key = `"gold"`

#### Step 4: Decrypt the Full Message
Apply the repeating key `"gold"` to the entire cipher text using an online XOR tool or write a simple script to decode the full message: `khi{FlashBytes_1910}`
