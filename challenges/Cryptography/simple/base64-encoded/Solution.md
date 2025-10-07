# Flashes in Base
* **Description** A message from the Golden Flashes was buried in strange symbols. Decode the base and uncover the truth they left behind.
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Simple
* **Flag:** khi{Fight_On_For_Victory}

## Steps
#### Step 1: Identify Base64 Encoding
Recognize that this is Base64 encoding. Base64 is identified by its characteristic alphabet of A-Z, a-z, 0-9, +, and /, often ending with padding characters (=).

#### Step 2: Analyze the Base64 String
The string `a2hpe0ZpZ2h0X09uX0Zvcl9WaWN0b3J5fQ==` ends with `==`, which is typical Base64 padding.

#### Step 3: Decode Using Tools
Use an online Base64 decoder or command line tool:
- Online: [base64decode.org](https://www.base64decode.org/)
- Command line: `echo "a2hpe0ZpZ2h0X09uX0Zvcl9WaWN0b3J5fQ==" | base64 -d`

#### Step 4: Retrieve the Final Flag
The decoded result reveals: `khi{Fight_On_For_Victory}`
