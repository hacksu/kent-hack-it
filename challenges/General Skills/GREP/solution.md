# GREP Challenge Solution

## Flag Location

The flag is hidden in the environment variables section of the `data.txt` file, specifically in this line:

```
export DATABASE_URL="postgresql://produser:khi{gr3p_m4st3r_f1nd_th3_n33dl3}@db.example.com:5432/production"
```

## Flag Value

```
khi{gr3p_m4st3r_f1nd_th3_n33dl3}
```

## Solution Methods

### Method 1: Simple String Search
```bash
grep "khi{" data.txt
```

### Method 2: Pattern Matching with Regular Expressions  
```bash
grep -E "khi\{[^}]+\}" data.txt
```

### Method 3: Case-Insensitive Search (if needed)
```bash
grep -i "khi{" data.txt
```

### Method 4: Show Line Numbers for Context
```bash
grep -n "khi{" data.txt
```

This will output:
```
163:export DATABASE_URL="postgresql://produser:khi{gr3p_m4st3r_f1nd_th3_n33dl3}@db.example.com:5432/production"
```

## Expected Output

When running the correct grep command, participants should see the line containing the flag. The flag `khi{gr3p_m4st3r_f1nd_th3_n33dl3}` is embedded within what appears to be a database connection string.

## Teaching Points

This challenge demonstrates:

1. **Basic grep usage**: Simple string searching in text files
2. **Pattern recognition**: Understanding that flags follow specific formats
3. **Real-world context**: Flags might be hidden in realistic-looking data like configuration files
4. **Command-line efficiency**: Using grep is much faster than manually reading through large files

## Alternative Solutions

Participants might also use:
- `cat data.txt | grep khi{`
- `less data.txt` and then search with `/khi{`
- Text editors with search functionality

However, the challenge emphasizes learning `grep` as the primary tool for this type of text searching task.

## Difficulty Assessment

- **Beginner Level**: The flag pattern is distinctive and easy to search for
- **File Size**: Large enough to make manual searching impractical but not overwhelming
- **Context**: Realistic system data that might be encountered in real CTF or security scenarios


* It is also possible to use the ctrl+f function in a text editor to solve this