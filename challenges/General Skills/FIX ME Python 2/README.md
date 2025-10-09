# Fix Me Python 2 Challenge - Medium Difficulty

## Overview
This is an intermediate-level Python debugging challenge. You are given a Python file with more complex and subtle bugs that require deeper understanding of Python algorithms and data structures.

## Files provided:
- `main.py`: Contains buggy functions that need to be fixed
- `oracle.pyc`: Compiled test program that checks your fixes (cannot be modified)

## Instructions:

1. **Analyze the functions** in `main.py` and identify the bugs
2. **Fix the bugs** in the functions 
3. **Run the oracle**: `python oracle.pyc`
4. If all tests pass, you'll get the flag!

## Functions to Fix:

### `fibonacci(n)`
Calculates the nth Fibonacci number using recursion. There's a critical error in the recursive call!

### `merge_sorted_lists(list1, list2)`
Merges two sorted lists into one sorted list. The merging logic is incomplete - some elements get left behind.

### `count_word_frequency(text)`
Counts word frequency in text. Doesn't properly handle case sensitivity and punctuation.

### `binary_search(arr, target)`
Performs binary search on a sorted array. Classic off-by-one error that causes index out of range.

### `flatten_nested_list(nested_list)`
Flattens a nested list of arbitrary depth. This one might actually be correct... or is it?

### `find_missing_number(nums)`
Finds the missing number in a sequence. The mathematical formula is wrong.

## Challenge Level: Medium

This challenge tests:
- **Recursion and base cases** - Understanding how recursive algorithms work
- **Algorithm correctness** - Proper implementation of common algorithms  
- **Edge case handling** - What happens with empty lists, boundary conditions
- **Data structure manipulation** - Working with lists, dictionaries
- **Mathematical logic** - Correct formulas and calculations
- **Text processing** - Handling strings, case sensitivity, punctuation

## Hints:
- Pay careful attention to recursive calls - make sure you're calling the right thing
- Think about what happens when lists have different lengths
- Consider case sensitivity and special characters in text
- Watch out for array bounds and indexing
- Test your logic with edge cases (empty lists, single elements)
- Double-check mathematical formulas

## Testing:
Run `python oracle.pyc` to test your fixes. The oracle will run comprehensive tests on each function and provide detailed feedback.

## Expected Output:
When all functions are fixed correctly, you should see:
```
🎉 ALL TESTS PASSED! 🎉
FLAG: khi{python_master_level2_[number]}
```

## Difficulty Progression:
- **Level 1**: Basic syntax and logic bugs
- **Level 2** (This challenge): Algorithm correctness and advanced concepts
- **Level 3**: Would involve complex algorithms, optimization, and advanced Python features

Good luck debugging!