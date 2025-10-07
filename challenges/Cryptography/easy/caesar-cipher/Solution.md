# The Golden Shift
* **Description** The Golden defenders used an ancient Roman technique to protect their secrets. Each letter follows the same pattern. Can you crack their code?
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Easy
* **Flag:** khi{Golden_Key_Defense}

## Steps
#### Step 1: Identify the Cipher Type
Recognize that this is a [Caesar cipher](https://en.wikipedia.org/wiki/Caesar_cipher), a substitution cipher where each letter is shifted a fixed number of positions in the alphabet.

#### Step 2: Determine Decryption Approach
Since there are only 25 possible shifts (26 would return the original text), you can try each shift manually or use an online Caesar cipher decoder.

#### Step 3: Test Different Shift Values
Try different shift values with the cipher text `sqr{Pytmnx_Sng_Mnonxcn}`:
- Shift by different amounts until readable English appears
- The correct shift reveals: `khi{Golden_Key_Defense}`
