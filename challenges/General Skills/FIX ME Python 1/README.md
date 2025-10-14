# Fix Me Python 1 Challenge

## Overview
You are given a Python file with buggy functions and a test oracle. Your task is to fix the bugs in the functions to make the oracle output the flag.

## Files provided:
- `main.py`: Contains buggy functions that need to be fixed
- `oracle.pyc`: Compiled test program that checks your fixes (cannot be modified)

## Instructions:

1. **Analyze the functions** in `main.py` and identify the bugs
2. **Fix the bugs** in the functions
3. **Run the oracle**: `python oracle.pyc`
4. If all tests pass, you'll get the flag!

## Functions to Fix:

### `calculate_sum(n)`
Calculates the sum of numbers from 1 to n. There's an off-by-one error lurking here!

### `is_prime(num)`
Checks if a number is prime. The logic is mostly correct, but there's an efficiency issue that could cause problems with larger numbers.

### `find_max(numbers)`
Finds the maximum number in a list. Pay attention to the loop range!

### `reverse_string(s)`
Reverses a string. Almost works perfectly, but something gets cut off...

## Hints:
- Look carefully at loop conditions and ranges
- Pay attention to boundary cases in your algorithms
- Think about what happens at the edges (first element, last element, etc.)
- Consider efficiency - some algorithms can be optimized

## Testing:
Run `python oracle.pyc` to test your fixes. The oracle will run comprehensive tests on each function and tell you which ones pass or fail.

## Expected Output:
When all functions are fixed correctly, you should see:
```
🎉 ALL TESTS PASSED! 🎉
FLAG: khi{python_debugging_master_[number]}
```

## Difficulty: Easy to Medium
This challenge is designed to test:
- Basic Python syntax and logic
- Understanding of common programming bugs
- Loop and range mechanics
- Debugging skills

Good luck!