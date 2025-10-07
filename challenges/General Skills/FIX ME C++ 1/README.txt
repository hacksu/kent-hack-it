Fix Me C++ Challenge
===================

You are given a C++ file with buggy functions and a pre-compiled test oracle.
Your task is to fix the bugs in the functions to make the oracle output the flag.

Files provided:
- main.cpp: Contains buggy functions that need to be fixed
- oracle.o: Pre-compiled test program (or oracle executable)

Instructions:

EASY WAY (using Makefile):
1. Analyze the functions in main.cpp and identify the bugs
2. Fix the bugs in the functions
3. Run: make
4. Run: ./test (or .\test.exe on Windows)
5. If all tests pass, you'll get the flag!

MANUAL WAY (if make is not available):
1. Analyze the functions in main.cpp and identify the bugs
2. Fix the bugs in the functions  
3. Compile your fixed code: g++ -c -o functions.o main.cpp
4. Link with the oracle: g++ -o test oracle.o functions.o
5. Run the test: ./test (or .\test.exe on Windows)
6. If all tests pass, you'll get the flag!

Additional make commands:
- make run    : Compile and run your solution in one step
- make clean  : Clean up generated files
- make help   : Show detailed help

Hint: Look carefully at loop conditions and mathematical logic.
Pay attention to boundary cases in your algorithms.

Good luck!