Fix Me C++ Challenge 2 - MEDIUM DIFFICULTY
===========================================

You are given a C++ file with multiple complex bugs and a pre-compiled test oracle.
Your task is to find and fix ALL the bugs to make the oracle output the flag.

WARNING: This challenge involves memory management, buffer overflows, and 
algorithmic errors. Some bugs may cause crashes or memory leaks!

Files provided:
- main.cpp: Contains buggy functions with logic errors
- oracle.o: Pre-compiled test oracle (DO NOT DELETE!)
- Makefile: Build system
- build.bat: Windows build helper

Instructions:

EASY WAY (using Makefile):
1. Analyze ALL the functions in main.cpp and identify the bugs
2. Fix the bugs in the functions (logic, boundaries, algorithms)
3. Run: make
4. Run: ./test (or .\test.exe on Windows)
5. If all tests pass, you'll get the flag!

MEMORY CHECKING (recommended):
1. Fix the bugs as above
2. Run: make memcheck (if valgrind is available)
3. This will help detect memory leaks and buffer overflows

MANUAL WAY (if make is not available):
1. Fix all the bugs in main.cpp
2. Compile your functions: g++ -c -o functions.o main.cpp  
3. Link with pre-compiled oracle: g++ -o test oracle.o functions.o
4. Run: ./test

WINDOWS WAY (using build.bat):
1. Fix the bugs in main.cpp
2. Run: build.bat
3. Run: test.exe

Types of bugs to look for:
- Memory allocation errors (buffer overflows)
- Off-by-one errors in loops and array access
- Incorrect algorithm implementations
- Missing edge case handling
- Boundary condition errors
- Logic errors in comparisons

Additional make commands:
- make run      : Compile and run your solution
- make memcheck : Run with memory leak detection
- make clean    : Clean up generated files
- make help     : Show detailed help

Good luck! This one's trickier than the first challenge.