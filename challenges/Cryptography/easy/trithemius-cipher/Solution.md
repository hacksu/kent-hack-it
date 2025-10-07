# Progressive Golden Shifts
* **Description** The Golden Flashes discovered that using the same shift for every letter was too predictable. What if each letter used a different shift that increases as you go? This cipher grows stronger with each position.
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Easy
* **Flag:** khi{AnotherGoldenShift}

## Steps
#### Step 1: Identify the Cipher Pattern
Recognize that this is a modified [Trithemius cipher](https://en.wikipedia.org/wiki/Trithemius_cipher), also known as a progressive Caesar cipher. However, this version uses a reversed alphabet as the key instead of the standard alphabet. Each letter is shifted by an amount equal to its position, but using a reversed alphabet (ZYXWVUTSRQPONMLKJIHGFEDCBA).

#### Step 2: Understand the Reversed Alphabet Key
The cipher uses a reversed alphabet substitution combined with progressive shifts:
- Normal alphabet: ABCDEFGHIJKLMNOPQRSTUVWXYZ
- Reversed alphabet: ZYXWVUTSRQPONMLKJIHGFEDCBA
- Each position also adds an additional shift equal to the position number

#### Step 3: Understand the Decryption Process
To decrypt this modified Trithemius cipher, you must:
1. First reverse the alphabet substitution (A↔Z, B↔Y, C↔X, etc.)
2. Then shift each letter backward by its position number (starting from position 0)
3. When shifting goes below 'a', wrap around to 'z'

#### Step 4: Apply Progressive Decryption
Decrypt each letter systematically using both the reversed alphabet and position shifts:
- Position 0: Apply reversed alphabet substitution, then shift back by 0
- Position 1: Apply reversed alphabet substitution, then shift back by 1
- Position 2: Apply reversed alphabet substitution, then shift back by 2
- Continue this pattern for all letters...

#### Step 5: Use Decryption Tools or Manual Calculation
Use an online Trithemius cipher decoder such as [CacheSleuth Trithemius Solver](https://www.cachesleuth.com/trithemius.html) which supports both alphabet substitution and progressive shifts, or manually apply both transformations. The systematic decryption reveals the plaintext message.

#### Step 6: Format the Final Flag
The decrypted message reveals: `AnotherGoldenShift`
Format according to the challenge requirements: `khi{AnotherGoldenShift}`
This demonstrates how the Golden Flashes evolved from simple Caesar ciphers to more sophisticated progressive encryption methods using multiple layers of obfuscation.
