# Manchester Field Puzzle
* **Description** In the shadow of Manchester Field, Kent State's cryptic traditions live on. A puzzle of paired letters dances through out the field, echoing the secretive games of old societies. NOTE: You will have to add underscores to the flag formatted like khi{[decrypted_text]}.
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Hard
* **Flag:** khi{playing_at_manchester_field}

## Steps
### Step 1: Identify the Cipher Type
Recognize that the encrypted message in `cipher.txt` uses the Playfair cipher, which encrypts pairs of letters (digraphs) using a 5×5 key square. For more details and an example, see the [Playfair cipher Wikipedia page](https://en.wikipedia.org/wiki/Playfair_cipher#Example).

### Step 2: Build the Key Square
Open `_key.txt` and use the provided 5×5 square:

	K E N T S
	A U I V R
	Y B C D F
	G H L M O
	P Q W X Z

### Step 3: Break the Cipher Text into Digraphs
Read the cipher text from `cipher.txt` and split it into pairs:

	EG AW GI CA KL VK GV IL QU KS SU CR NH MT

### Step 4: Decrypt Each Digraph
For each pair, apply the following rules using the key square:
- If both letters are in the same row, replace each with the letter to its left (wrap around if needed).
- If both are in the same column, replace each with the letter above it (wrap around if needed).
- If neither, replace each with the letter in its own row but in the column of the other letter.

You can perform this manually or use an [online Playfair cipher decoder](https://planetcalc.com/7751/) to assist with decryption.

### Step 5: Combine and Format the Plaintext
Combine the decrypted letters to reveal the message. Add underscores between words as required for the flag format.

### Step 6: Extract and Submit the Flag
Format your answer as `khi{playing_at_manchester_field}` and submit.
