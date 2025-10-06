# sehsalF oG
* **Description** The Golden Flashes left their secrets mirrored in plain sight. Can you reflect the letters back to reveal their message?
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Easy
* **Flag:** khi{Flashpoint_Cipher}

## Steps
#### Step 1
Notice the title "sehsalF oG" is "Go Flashes" reversed, hinting at the Atbash cipher where letters are mirrored/reversed in the alphabet.

#### Step 2
The [Atbash cipher](https://en.wikipedia.org/wiki/Atbash) replaces each letter with its counterpart from the reverse alphabet - A becomes Z, B becomes Y, etc.

#### Step 3
Create the substitution mapping:
- Normal alphabet: ABCDEFGHIJKLMNOPQRSTUVWXYZ
- Atbash alphabet: ZYXWVUTSRQPONMLKJIHGFEDCBA

#### Step 4
Decode the cipher text by substituting each letter:
- Apply the Atbash substitution to reveal: `khi{Flashpoint_Cipher}`
