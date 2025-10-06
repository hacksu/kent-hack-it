# Golden Flash Express
* **Description** While exploring the old Kent State railroad depot, you discovered a coded message left by a Golden Flash operative. The message appears to use some kind of pattern-based encryption. Can you decode this mysterious cipher and uncover the secret message hidden within?
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Medium
* **Flag:** khi{zIgZaG_ThRoUgH_KeNt_sTaTiOn}

## Steps
#### Step 1
Examine the encrypted message in `cipher.txt` and identify that this is a rail fence cipher (also known as a zigzag cipher). Research the [Rail fence cipher](https://en.wikipedia.org/wiki/Rail_fence_cipher) to understand how text is written in a zigzag pattern across multiple "rails" and then read off line by line.

#### Step 2
This cipher uses exactly 5 rails. Apply the rail fence decryption with a key of 5:
- Distribute the ciphertext `{_UZnstgoagkOTNHRGIhiae_h_ziTKT}` across 5 rails
- Recreate the zigzag pattern: Rail 1 (top), Rail 2, Rail 3 (middle), Rail 4, Rail 5 (bottom), Rail 4, Rail 3, Rail 2, Rail 1, and so on
- The direction changes at each rail boundary

#### Step 3
Read the message by taking all characters from rail 1, then all from rail 2, then all from rail 3, etc. This reconstructs the intermediate plaintext that was encoded by the rail fence cipher.

#### Step 4
After decoding with the rail fence cipher, you must reverse the entire resulting text string. The text needs to be read backwards to reveal the final message.

#### Step 5
Look for the flag format `khi{...}` within the final decrypted and reversed text. The flag will appear as: `khi{zIgZaG_ThRoUgH_KeNt_sTaTiOn}`. This represents navigating through the zigzag pattern like a train moving through Kent's historic station.
