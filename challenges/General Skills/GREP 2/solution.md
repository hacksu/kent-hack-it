# GREP Challenge 2 Solution

## Flag Location

The flag is hidden as a base64 encoded string in the Python Flask API section of the `data.txt` file, specifically on line 593:

```
secret_key = a2hpe0I0UzNfNjRfR1IzUDNEfQ==
```

## Flag Value

The base64 string `a2hpe0I0UzNfNjRfR1IzUDNEfQ==` decodes to:

```
khi{B4S3_64_GR3P3D}
```

## Solution Methods

### Method 0: Use the '==' ending
```bash
grep "==" data.txt
```

### Method 1: Find Base64 Pattern
```bash
grep -E "[A-Za-z0-9+/]{20,}={0,2}" data.txt
```

### Method 2: Search for Specific Base64 String
```bash
grep "a2hpe0I0UzNfNjRfR1IzUDNEfQ==" data.txt
```

### Method 3: Search with Line Numbers
```bash
grep -n "a2hpe0I0UzNfNjRfR1IzUDNEfQ==" data.txt
```

This will output:
```
593:secret_key = a2hpe0I0UzNfNjRfR1IzUDNEfQ==
```

### Method 4: Decode the Base64 String
After finding the base64 string, decode it using:

**Linux/macOS:**
```bash
echo "a2hpe0I0UzNfNjRfR1IzUDNEfQ==" | base64 -d
```

**Windows PowerShell:**
```powershell
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('a2hpe0I0UzNfNjRfR1IzUDNEfQ=='))
```

## Expected Output

When running the correct grep command, participants should see the line containing the base64 encoded flag. The flag `khi{B4S3_64_GR3P3D}` is encoded as a base64 string that appears to be a secret key in a Python Flask application.

## Teaching Points

This challenge demonstrates:

1. **Advanced grep usage**: Using regular expressions to find base64 patterns
2. **Pattern recognition**: Identifying base64 encoded strings among other data
3. **Base64 decoding**: Understanding how to decode base64 strings to reveal hidden content
4. **Real-world context**: Flags might be encoded and hidden in application code or configuration files
5. **Multi-step problem solving**: First finding the encoded data, then decoding it to get the flag

## Alternative Solutions

Participants might also use:
- `cat data.txt | grep -E "[A-Za-z0-9+/]{20,}={0,2}"`
- `less data.txt` and then search with `/a2hpe0I0UzNfNjRfR1IzUDNEfQ==`
- Text editors with search functionality (Ctrl+F)
- Online base64 decoders after finding the encoded string

However, the challenge emphasizes learning `grep` with regular expressions and command-line base64 decoding.

## Difficulty Assessment

- **Medium Level**: Requires understanding of base64 encoding and regex patterns
- **Multi-step Process**: Finding the encoded string AND decoding it to get the flag
- **File Size**: Large enough to make manual searching impractical
- **Context**: Realistic system data that might be encountered in real security scenarios
- **Skills Required**: Advanced grep with regex, base64 decoding knowledge

## Step-by-Step Walkthrough

1. **Search for base64 patterns**: Use `grep -E "[A-Za-z0-9+/]{20,}={0,2}" data.txt` to find potential base64 strings
2. **Identify suspicious strings**: Look for strings that might contain encoded flags
3. **Decode the base64**: Use command-line tools or online decoders to decode `a2hpe0I0UzNfNjRfR1IzUDNEfQ==`
4. **Verify the flag**: Confirm the decoded result `khi{B4S3_64_GR3P3D}` follows the expected flag format