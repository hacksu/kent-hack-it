# Fix Me Python 2 - Solution Guide (Medium Difficulty)

## Challenge Overview
This intermediate challenge tests participants' understanding of more complex programming concepts including recursion, algorithm correctness, data structure manipulation, and edge case handling.

## Bugs and Their Fixes

### 1. `fibonacci(n)` - Incorrect Recursive Call
**Bug**: `return fibonacci(n-1) + fibonacci(n-1)`
**Fix**: `return fibonacci(n-1) + fibonacci(n-2)`

**Explanation**: The Fibonacci sequence is defined as F(n) = F(n-1) + F(n-2). The buggy version calls `fibonacci(n-1)` twice instead of calling both `fibonacci(n-1)` and `fibonacci(n-2)`. This results in exponential growth (powers of 2) instead of the Fibonacci sequence.

**Test Cases**:
- `fibonacci(2)` should return 1, but returns 2 with the bug
- `fibonacci(3)` should return 2, but returns 4 with the bug
- The pattern shows doubling instead of proper Fibonacci growth

### 2. `merge_sorted_lists(list1, list2)` - Missing Merge Logic  
**Bug**: Only appends remaining elements from `list1`, ignores remaining elements from `list2`
**Fix**: Add a second while loop to append remaining elements from `list2`

**Explanation**: After the main merging loop, there might be remaining elements in either list. The original code only handles remaining elements in `list1` but forgets about `list2`.

**Test Cases**:
- `merge_sorted_lists([1, 3, 5], [2, 4, 6])` returns `[1, 2, 3, 4, 5]` instead of `[1, 2, 3, 4, 5, 6]`
- `merge_sorted_lists([], [4, 5, 6])` returns `[]` instead of `[4, 5, 6]`

### 3. `count_word_frequency(text)` - Case Sensitivity and Punctuation
**Bug**: `words = text.split()` doesn't handle punctuation or case
**Fix**: Use regex to extract words and convert to lowercase

**Explanation**: Simple `split()` doesn't remove punctuation, and doesn't normalize case. "Python," and "python" are treated as different words.

**Test Cases**:
- `"Hello World hello world"` should count `{"hello": 2, "world": 2}` but counts each case separately
- `"Python, Python! Python?"` should count `{"python": 3}` but treats punctuation as part of words

### 4. `binary_search(arr, target)` - Off-by-One Error
**Bug**: `right = len(arr)` should be `right = len(arr) - 1`
**Fix**: Initialize `right` to `len(arr) - 1`

**Explanation**: Array indices go from 0 to len(arr)-1, not 0 to len(arr). When `right = len(arr)`, accessing `arr[right]` causes an index out of range error.

**Test Cases**:
- `binary_search([1, 2, 3, 4, 5], 6)` causes IndexError instead of returning -1

### 5. `flatten_nested_list(nested_list)` - Actually Correct!
**Bug**: None - this function is implemented correctly
**Fix**: No fix needed

**Explanation**: This is a red herring. The function correctly uses recursion and type checking to flatten nested lists. All test cases pass.

### 6. `find_missing_number(nums)` - Wrong Mathematical Formula
**Bug**: `n = len(nums) + 1` and wrong sum formula
**Fix**: `n = len(nums)` and correct the expected sum calculation

**Explanation**: If we have a list that should contain numbers 0 to n with one missing, and the list has length k, then n = k (not k+1). The sum of numbers 0 to n is n*(n+1)/2.

**Test Cases**:
- `find_missing_number([0, 1, 3])` should return 2, but the wrong formula gives 6
- The bug compounds the error by using wrong n value and wrong sum formula

## Expected Flag Calculation
When all functions are fixed:
- `fibonacci(6)` = 8
- `binary_search([10, 20, 30, 40, 50], 30)` = 2 (index of 30)
- `find_missing_number([0, 2, 3])` = 1
- Flag calculation: 8 * 100 + 2 * 10 + 1 = 821

**Flag**: `khi{python_master_level2_821}`

## Teaching Points
This challenge teaches:
1. **Recursive algorithm correctness** - Understanding what each recursive call should do
2. **Complete algorithm implementation** - Don't forget edge cases and cleanup steps
3. **Text processing** - Proper string manipulation with regex and case handling  
4. **Array bounds and indexing** - Classic off-by-one errors
5. **Mathematical reasoning** - Correct formulas and logical thinking
6. **Debugging methodology** - Some functions might be correct (red herrings)

## Difficulty Assessment
- **Medium** difficulty
- Requires solid understanding of algorithms and data structures
- Tests ability to reason about recursive functions
- Good for intermediate programmers learning debugging skills

## Common Mistakes Participants Might Make
1. **Not testing edge cases** - Missing the merge_sorted_lists bug with empty lists
2. **Assuming all functions have bugs** - The flatten function is actually correct
3. **Not understanding recursion** - Fibonacci is a classic recursion example
4. **Ignoring mathematical logic** - The missing number formula requires careful thinking

## Setup Notes for Organizers  
1. The `oracle.pyc` file provides tamper resistance like the C++ version
2. Participants can only modify `main.py`
3. The challenge tests progressively harder concepts than Level 1
4. Consider this as a stepping stone to even more advanced challenges

FLAG: khi{python_master_level2_821}