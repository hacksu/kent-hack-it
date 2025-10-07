# Fix Me C++ Challenge - Solution

## Challenge Overview
This is an easy-level CTF challenge where participants must fix bugs in C++ functions to get the correct output from a test oracle.

## Files Provided to Participants
- `main.cpp` - Contains buggy C++ functions that need to be fixed
- `oracle.o` - Pre-compiled oracle object file that tests the functions
- `README.txt` - Instructions for compiling and testing

## Bugs in the Code

### Bug 1: Off-by-one error in `calculateSum` function
**Location:** Line 8 in `main.cpp`
**Problem:** 
```cpp
for (int i = 1; i < n; i++) {  // BUG: should be i <= n
```
**Fix:** 
```cpp
for (int i = 1; i <= n; i++) {  // FIXED
```
**Explanation:** The loop should include `n` in the sum calculation. With `i < n`, it stops at `n-1`, missing the final number.

### Bug 2: Inefficient and incorrect prime checking in `isPrime` function  
**Location:** Line 20 in `main.cpp`
**Problem:**
```cpp
for (int i = 3; i < num; i += 2) {  // BUG: should be i * i <= num
```
**Fix:**
```cpp
for (int i = 3; i * i <= num; i += 2) {  // FIXED
```
**Explanation:** 
- The original code checks all odd numbers up to `num-1`, which is inefficient
- The correct approach only needs to check up to the square root of `num`
- This also fixes correctness issues for large numbers where the original would be too slow

## How to Solve

1. **Identify the bugs:** Run the provided `main.cpp` and notice the incorrect outputs
2. **Fix the calculateSum function:** Change `i < n` to `i <= n` in the loop condition
3. **Fix the isPrime function:** Change `i < num` to `i * i <= num` in the loop condition
4. **Compile and test:** Compile the fixed code with the oracle to get the flag

## Compilation Instructions

For participants:
```bash
# Fix the bugs in main.cpp, then:
g++ -c -o functions.o main.cpp          # Compile functions to object file
g++ -o test oracle.o functions.o        # Link with pre-compiled oracle
./test                                  # Run the test
```

For challenge organizers testing:
```bash
# First compile the oracle (one-time setup):
g++ -c -o oracle.o oracle.cpp

# Test with broken version (should fail):
g++ -c -o functions_broken.o main.cpp
g++ -o test_broken oracle.o functions_broken.o
./test_broken

# Test with fixed version (should output flag):
g++ -c -o functions_fixed.o main_fixed.cpp  
g++ -o test_fixed oracle.o functions_fixed.o
./test_fixed
```

## Expected Flag
When all tests pass, the oracle outputs: `khi{c++_debugging_is_ez_128}`

## Learning Objectives
- Identifying common off-by-one errors
- Understanding loop conditions and boundary cases
- Basic debugging skills in C++
- Understanding prime number algorithms and optimization

## Difficulty Level
**Easy** - Suitable for beginners who understand basic C++ syntax and loops.