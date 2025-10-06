# Dr. Nesterenko's Hidden Research
* **Description** Our beloved CS department chair and CS3 professor has scattered fragments of his secret research project across his personal website. The information has been distributed using a mathematical technique that requires collecting multiple pieces to reconstruct the complete data. You'll need to explore his academic pages thoroughly and apply advanced cryptographic reconstruction methods to uncover what he's been working on.
* **Event:** Kent Hack It 2025
* **Category:** Crypto
* **Difficulty:** Hard
* **Points:** ?
* **Flag:** khi{byzantine_resilient_self_stabilizing_systems}
* **Tools Required / Used:** Web browser, Shamir's Secret Sharing reconstruction algorithm

## Steps
#### Step 1
Examine the provided cipher.txt file. You'll find 10 fragment values (y-coordinates), a threshold requirement of 6 out of 10, and a prime modulus. You need to find the corresponding x-coordinates from Dr. Nesterenko's personal website.

#### Step 2
Visit http://antares.cs.kent.edu/~mikhail/Personal/ and explore the website structure. Use the provided hint files to guide your search for 10 specific numbers hidden throughout the professor's personal website pages.

#### Step 3 Part 1
**Books Section** - Navigate to the books.html page and examine the reading notes:
- From road.txt (2006, "On the Road" by Jack Kerouac): Find the reference to "50 pages to go" → **50**
- From bear.txt (2009, "Afghanistan, The Bear Trap"): Find the reference to "page 67 or so" → **67**

#### Step 3 Part 2
**Quotes Section** - Navigate to quotes.html and locate specific historical references:
- Find the teaching of al-Yaraghi, muslim leader in Chechnya and Daghestan from the 1820s → **1820**
- Find the reference to "White Trash: The 400-Year Untold History of Class in America" → **400**

#### Step 3 Part 3
**Stories Section** - Navigate to the Stories/ directory and examine the text files:
- From t34.txt: The filename itself contains the number → **34**
- From personalBest.txt: Find the reference to "a PR by 16 seconds" → **16**

#### Step 3 Part 4
**Movies Section** - Navigate to movies.txt and find the design pattern references, then look up movie runtimes:
- Mediator pattern - "Pushing Tin": Runtime is 124 minutes → **124**
- Observer pattern - "The Matrix": Runtime is 136 minutes → **136**

#### Step 3 Part 5
**System Administration Section** - Navigate to Sysadmin.Kansas/ and find technical specifications:
- From "Setting Up RAID": Find reference to "RAID 5" configuration → **5**
- From "Bringing Helios to life": Find "upgraded to 10 UltraSPARC2 processors" → **10**

#### Step 4
Match your discovered numbers to the fragment values in cipher.txt. The discovered numbers (50, 67, 1820, 400, 34, 16, 124, 136, 5, 10) are the x-coordinates. The y-coordinates in cipher.txt are listed in ascending order by their corresponding x-coordinates. Sort your found x-coordinates in ascending order (5, 10, 16, 34, 50, 67, 124, 136, 400, 1820) and pair them with the y-coordinates in the same order.

#### Step 5
Apply Shamir's Secret Sharing reconstruction algorithm using any 6 of the 10 coordinate pairs (x,y). Use Lagrange interpolation to reconstruct the polynomial and evaluate it at x=0 to recover the original secret.

#### Step 6
Convert the reconstructed integer back to text to reveal the flag: `khi{byzantine_resilient_self_stabilizing_systems}`.
