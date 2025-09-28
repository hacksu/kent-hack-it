# The Golden Shift
* **Description** Can you crack the code and prove yourself a true Golden Cipherbreaker?
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Easy
* **Points:** ?
* **Flag:** khi{Golden_Key_Defense}

## Steps
#### Step 1
Recognize that this is a [Caesar cipher](https://en.wikipedia.org/wiki/Caesar_cipher), a substitution cipher where each letter is shifted a fixed number of positions in the alphabet.

#### Step 2
Since there are only 25 possible shifts (26 would return the original text), you can try each shift manually or use an online Caesar cipher decoder.

#### Step 3
Try different shift values with the cipher text `sqr{Pytmnx_Sng_Mnonxcn}`:
- Shift by different amounts until readable English appears
- The correct shift reveals: `khi{Golden_Key_Defense}`

#### Step 4
Alternatively, use frequency analysis or online tools like [cryptii.com](https://cryptii.com/pipes/caesar-cipher) to automatically find the correct shift.
