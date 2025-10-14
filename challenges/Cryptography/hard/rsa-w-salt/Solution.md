# The Golden Salty Secret
* **Description** Deep within the archives of Kent State University, a cryptic message awaits. Before it was locked away, a random sequence of bytes was mixed in to obscure the true secret. Only those who understand the art of unraveling layered encryption can reveal the flag.
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Hard
* **Flag:** khi{Th3_sa1TYneSs}

## Steps
### Step 1: Understand the Encryption Scheme
The flag is not directly encrypted. Instead, a random salt (16 bytes) is prepended to the flag, and the combined message is encrypted with RSA. This means the decrypted message will start with 16 random bytes, followed by the flag.

### Step 3: Analyze the RSA Public Key
Open `key.pub` to view the public key. The modulus is intentionally weak (512 bits) for CTF purposes, making it vulnerable to certain attacks (e.g., factorization, Wiener's attack). However, for this challenge, the private key is not provided, so you must focus on the decryption process if the private key is known.

### Step 4: Decrypt the Ciphertext
Before you can decrypt the message, you must first recover the private key. The modulus in `key.pub` is intentionally weak (512 bits), so you can use outside tools such as `yafu`, `msieve`, or online factorization services to factor the modulus and reconstruct the private key.

Once you have obtained the private key, use the provided `_solve_example.py` script to decrypt the flag. This script loads the private key and ciphertext, performs decryption, and extracts the flag by skipping the first 16 bytes (the salt):

### Step 5: Extract the Flag
After decryption, discard the first 16 bytes (the salt) and decode the remainder to get the flag. The flag format is `khi{Th3_sa1TYneSs}`.

### Step 6: Submit the Flag
Format your answer as `khi{Th3_sa1TYneSs}` and submit.
