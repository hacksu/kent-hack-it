# Another Golden Shift?
* **Description** This looks like a another challenge, but the key isn't as simple as the last. I wonder why are there multiple Golden Shifts?
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Easy
* **Flag:** khi{Golden_Eagles_Soar}

## Steps
#### Step 1: Identify the Cipher Type
Recognize that this is a [Vigenère cipher](https://en.wikipedia.org/wiki/Vigen%C3%A8re_cipher), a polyalphabetic substitution cipher that uses a repeating keyword to encrypt text. It looks familiar because it's essentially multiple Caesar ciphers applied in sequence! Unlike a single Caesar cipher with one fixed shift, the Vigenère cipher uses different shifts for each letter position based on the repeating key. This is why a simple Caesar cipher approach won't work - each letter is shifted by a different amount.

#### Step 2: Analyze the Cipher Text
Examine the encrypted message: `yvq{Sjpfrt_Kpgnth_Fjib}`
Notice that this follows the standard flag format, so `yvq` likely decrypts to `khi`, which can help us determine the key.

#### Step 3: Determine the Key Using Known Plaintext
Since we know the flag starts with `khi{`, we can work backwards:
- y → k: Shift of -14 (or +12)
- v → h: Shift of -14 (or +12) 
- q → i: Shift of -8 (or +18)
- This suggests the key starts with "ONW" which points to "ON WITH PURPOSE"

#### Step 4: Brute Force or Deduce the Complete Key
From the pattern analysis, you know the key starts with "ONW". You can either:
- **Brute force approach**: Try common Kent State-related phrases that start with "ON" 
- **Deduction approach**: Think about Kent State's well-known tagline: "ON WITH PURPOSE"
- **Use the hint**: The hint tells you to think about memorable phrase to help with deduction

Apply the key "OnwithPurpose" to the entire cipher text using a Vigenère decoder tool such as [cryptii.com](https://cryptii.com/pipes/vigenere-cipher) or [dcode.fr](https://www.dcode.fr/vigenere-cipher).

#### Step 5: Extract the Final Flag
Decrypting with key "OnwithPurpose" reveals: `khi{Golden_Eagles_Soar}`
