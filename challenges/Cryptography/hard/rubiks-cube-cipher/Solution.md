# Twists of Mystery
* **Description** Somewhere in the halls of Kent State, a message is concealed by a series of colorful twists. Only those who understand the art of permutation and restoration can reveal the secret. Can you untangle the moves and discover the hidden flag?
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Hard
* **Flag:** khi{quick_rubiks_scramble}

## Steps
### Step 1: Observe the Puzzle
Open `cipher.txt`. The first line is a sequence of moves (the key), and the second line is a scrambled message encoded by those moves.

### Step 2: Understand the Moves
Each move in the key represents a transformation. The ciphered text is the result of applying these moves to the original message.

### Step 3: Restore the Order
To reveal the message, you must reverse the process: invert each move and apply them in reverse order to the ciphered text. You may use permutation tools, simulators, or write a script to automate this restoration.

### Step 4: Reveal the Secret
Once the original order is restored, extract the plaintext. The answer may be hidden in the arrangement or mapped sequence.

### Step 5: Submit the Flag
Format your answer as `khi{restored_secret}` and submit.
