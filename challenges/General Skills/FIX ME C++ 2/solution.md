# Fix Me C++ Challenge 2 - Solution (MEDIUM DIFFICULTY)

## Challenge Overview
This is a medium-level CTF challenge focusing on memory management, algorithmic correctness, and edge case handling. Participants must fix multiple complex bugs in C++ functions.

## Files Provided to Participants
- `main.cpp` - Contains buggy C++ functions with memory and logic errors
- `oracle.cpp` - Oracle source code (compiled automatically)
- `Makefile` - Build system with memory checking
- `README.txt` - Instructions and warnings

## Bugs and Fixes

### Bug 1: Buffer Overflow in `reverseString` function
**Location:** Lines 20-25 in `main.cpp`

**Problems:**
1. `malloc(len)` - Not enough space for null terminator
2. `result[len] = '\0'` - Writing beyond allocated memory

**Fixes:**
```cpp
// BEFORE (buggy):
char* result = (char*)malloc(len);  // Not enough space
result[len] = '\0';  // Buffer overflow

// AFTER (fixed):
char* result = (char*)malloc(len + 1);  // +1 for null terminator  
result[len] = '\0';  // Now safe
```

### Bug 2: Logic Errors in `maxSubarraySum` function (Kadane's Algorithm)
**Location:** Lines 30-46 in `main.cpp`

**Problems:**
1. `maxSoFar = 0` - Should be initialized to first element for all-negative arrays
2. `if (maxSoFar > maxEndingHere)` - Wrong comparison operator
3. Algorithm doesn't handle all-negative arrays correctly

**Fixes:**
```cpp
// BEFORE (buggy):
int maxSoFar = 0;  // Wrong initialization
int maxEndingHere = 0;
if (maxSoFar > maxEndingHere) {  // Wrong comparison

// AFTER (fixed):
int maxSoFar = arr[0];  // Initialize to first element
int maxEndingHere = arr[0];
// Proper Kadane's algorithm implementation
for (int i = 1; i < size; i++) {
    maxEndingHere = (arr[i] > maxEndingHere + arr[i]) ? arr[i] : maxEndingHere + arr[i];
    maxSoFar = (maxSoFar > maxEndingHere) ? maxSoFar : maxEndingHere;
}
```

### Bug 3: Infinite Loop and Overflow in `binarySearch` function
**Location:** Lines 50-65 in `main.cpp`

**Problems:**
1. `right = size` - Should be `size - 1`
2. `int mid = (left + right) / 2` - Potential integer overflow
3. `left = mid` and `right = mid` - Causes infinite loops

**Fixes:**
```cpp
// BEFORE (buggy):
int right = size;  // Should be size - 1
int mid = (left + right) / 2;  // Overflow risk
left = mid;  // Infinite loop risk
right = mid; // Infinite loop risk

// AFTER (fixed):
int right = size - 1;  // Correct boundary
int mid = left + (right - left) / 2;  // Prevent overflow
left = mid + 1;  // Proper binary search
right = mid - 1; // Proper binary search
```

### Bug 4: Missing Edge Cases in `factorial` function
**Location:** Lines 69-72 in `main.cpp`

**Problems:**
1. `if (n == 1)` - Doesn't handle `n = 0` case (0! = 1)
2. No check for negative numbers (undefined for negative inputs)

**Fixes:**
```cpp
// BEFORE (buggy):
if (n == 1) return 1;  // Missing n = 0 case
return n * factorial(n - 1);  // No negative check

// AFTER (fixed):
if (n < 0) return -1;  // Handle negative numbers
if (n == 0 || n == 1) return 1;  // Handle both 0 and 1
return n * factorial(n - 1);
```

### Bug 5: Boundary Errors in `mergeSortedArrays` function
**Location:** Lines 88-102 in `main.cpp`

**Problems:**
1. `while (i <= size1)` - Should be `i < size1`
2. `while (j <= size2)` - Should be `j < size2`
3. Memory leak documentation missing

**Fixes:**
```cpp
// BEFORE (buggy):
while (i <= size1) {  // Off-by-one error
while (j <= size2) {  // Off-by-one error

// AFTER (fixed):
while (i < size1) {   // Correct boundary
while (j < size2) {   // Correct boundary
```

## Expected Flag
When all tests pass: `khi{medium_c++_debugging_master_462}`
(Based on 11 tests * 42 = 462)

## Compilation and Testing

### For Participants:
```bash
make        # Compile everything
make run    # Compile and run
make memcheck  # Run with memory checking
```

### For Organizers:
```bash
make test-broken  # Should show multiple failures
make test-fixed   # Should show flag
```

## Learning Objectives
- Memory management and buffer overflow prevention
- Proper algorithm implementation (Kadane's, Binary Search)
- Edge case handling (empty inputs, negative numbers, boundary conditions)
- Memory leak detection and prevention
- Advanced debugging skills

## Difficulty Level
**Medium** - Requires understanding of:
- Dynamic memory allocation
- Common algorithmic patterns
- Edge case analysis
- Memory safety principles
- Multiple simultaneous bug identification

## Common Mistakes Participants Make
1. Fixing only some bugs and missing others
2. Not testing edge cases (empty strings, negative numbers)
3. Creating new memory leaks while fixing buffer overflows
4. Incorrect algorithm implementations (especially Kadane's algorithm)
5. Off-by-one errors in loop conditions