
# Code on The K
* **Description** Beneath the shadow of Kent State's iconic "K" on Front Campus, a cryptic message is relayed in silent ceremony. Flags wave in a coded dance, echoing traditions of campus signalers past. To reveal the flag, you'll need to interpret the true meaning behind each signal. NOTE: You will have to wrap and add underscores to the flag formatted like [khi]{[decrypted_text]}.
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Medium
* **Flag:** khi{decoded_semaphore_message}

## Steps
### Step 1: Identify the Encryption Method
Notice that the challenge uses flag semaphore, a visual signaling system where each letter is represented by the position of two flags. The message is encoded as a sequence of semaphore images in a GIF file.

### Step 2: Extract Frames from the GIF
Use an online tool or software (e.g., ezgif.com/split, GIMP, or Python's Pillow library) to split the GIF into individual frames. Each frame represents a single semaphore character.

### Step 3: Decode Each Frame
For each frame, match the flag positions to the semaphore alphabet. You can use semaphore reference charts or online decoders to help translate each image into its corresponding letter.

### Step 4: Combine the Decoded Letters
Put together the letters from each frame to reconstruct the plaintext message.

### Step 5: Format and Submit the Flag
Format your answer as `khi{decoded_semaphore_message}` and submit.
