# Kent State's Lost Archives
* **Description** A dusty file cabinet in Kent State's basement archives contained a mysterious encrypted document. This wartime research appears to contain historical analysis, but the text has been scrambled using a cipher technique from the 1940s. Your mission is to crack the code and uncover what secrets lie hidden in this academic treasure. The key to decryption may be closer than you think...
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Medium
* **Points:** ?
* **Flag:** khi{wartime_wisdom_unlocked}

## Steps
#### Step 1
Examine the encrypted text in `cipher_passage.txt`. Notice that this appears to be a substitution cipher where each letter is consistently replaced with another letter throughout the text. This is characteristic of a monoalphabetic substitution cipher, similar to techniques used during WWII. Research wartime encryption methods like the [Enigma machine](https://en.wikipedia.org/wiki/Enigma_machine).

#### Step 2
Use the english [frequency analysis](https://en.wikipedia.org/wiki/Letter_frequency) to determine the substitution pattern using manual counting or basic tools. Referencing the letter frequency shows the standard English letter frequencies:
- Most common English letters: E (12.7%), T (9.1%), A (8.2%), O (7.5%), I (7.0%), N (6.7%), S (6.3%), H (6.1%), R (6.0%)
- Count which letters appear most frequently in the encrypted text and map them to these expected frequencies

#### Step 3
Based on frequency analysis, map the cipher alphabet to the plain alphabet. This cipher uses a simple substitution where:
- The most frequent cipher letter likely represents 'E'
- The second most frequent likely represents 'T'
- Continue mapping based on frequency patterns and common English digrams/trigrams
This will not be a one-to-one so play with the order a little until it is in readable english.

#### Step 4
Once you've determined the substitution pattern, apply it systematically to decode the entire `cipher_passage.txt`. The decryption reveals historical content about ancient civilizations and their influence on modern cryptography.

#### Step 5
Look for the flag format `khi {...}` within the decrypted text. The flag will be embedded naturally within the historical content, appearing as: `khi {wartime_wisdom_unlocked}`. Remove the space and enter the flag.
