# Git Logs Solution

## Challenge Description
This challenge involves analyzing git logs to find hidden information or flags.

## Solution Steps

1. **Unzip the folder**
    ```bash
    unzip <folder-name>.zip
    cd <extracted-folder>
    ```

2. **Check git log history**
    ```bash
    git log
    git log --oneline
    ```

3. **Look for suspicious commits**
    - Check commit messages for clues
    - Look for unusual file changes

4. **Examine specific commits**
    ```bash
    git show <commit-hash>
    git diff <commit-hash>
    ```

5. **Search for flags or hidden content**
    ```bash
    git log --grep="flag"
    git log -p | grep -i "flag"
    ```

6. **Handle encoded files**
    ```bash
    # If file shows as Unicode/UTF-16, convert to readable format
    git show <commit-hash>:flag.txt > file.txt
    file file.txt  # Check file encoding
    iconv -f UTF-16LE -t UTF-8 file.txt  # Convert UTF-16 to UTF-8
    ```

## Flag
`khi{G1T_L0G5_FUN}`

## Notes
- Always check the entire git history
- Pay attention to commit messages and file diffs
- Use various git log options to reveal hidden information
- Files may be encoded in different formats (UTF-16, etc.) - use appropriate tools to decode