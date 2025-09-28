# Kent Read?
* **Description** One of my friends suggested and handed me a book to read. Later, when I opened the book a note fell out. What could this note mean? NOTE: Your input should be khi{[decrypted_text]} all lowercase.
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Easy
* **Points:** ?
* **Flag:** khi{isn't_reading_the_best}

## Steps
#### Step 1
Recognize that you have both a book text file and a note with numbers. This indicates a [book cipher](https://en.wikipedia.org/wiki/Book_cipher), where specific words are located using coordinate references within the book.

#### Step 2
Examine the note format: `08:30:02:12_09:36:05:12_02:18:02:01_05:41:01:07`
The hint `CHA:PAR:LIN:WOR` tells you the format is Chapter:Paragraph:Line:Word.

#### Step 3
Decode each coordinate set by finding the corresponding word in the book:
```
Coordinates     → Word
08:30:02:12    → isn't
09:36:05:12    → reading  
02:18:02:01    → the
05:41:01:07    → best
```

#### Step 4
Combine the decoded words to form the message: `isn't reading the best`
Format as requested with the flag wrapper: `khi{isn't_reading_the_best}`
