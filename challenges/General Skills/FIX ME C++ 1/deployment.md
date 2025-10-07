# Fix Me C++ Challenge - Deployment Instructions

## For Challenge Organizers

### Pre-Competition Setup

1. **Compile the Oracle**
   ```bash
   # Compile the oracle into an object file
   g++ -c -o oracle.o oracle.cpp
   
   # Or compile directly to executable (alternative approach)
   g++ -c oracle.cpp -o oracle.o
   ```

2. **Test with Fixed Version**
   ```bash
   # Compile the fixed version
   g++ -c -o functions_fixed.o main_fixed.cpp
   
   # Link and test
   g++ -o test_fixed oracle.o functions_fixed.o
   ./test_fixed
   
   # Should output: FLAG: hacksu{c++_debugging_is_ez_128}
   ```

3. **Test with Broken Version**
   ```bash
   # Compile the broken version
   g++ -c -o functions_broken.o main.cpp
   
   # Link and test
   g++ -o test_broken oracle.o functions_broken.o
   ./test_broken
   
   # Should show test failures
   ```

### Files to Distribute to Participants

**Provide these files:**
- `main.cpp` - The buggy functions to fix
- `oracle.o` - Pre-compiled oracle object file (or source if using Makefile)
- `README.txt` - Instructions
- `Makefile` - Easy build system
- `build.bat` - Windows fallback build script

**Alternative (Makefile approach):**
- `main.cpp` - The buggy functions to fix  
- `oracle.cpp` - Oracle source (Makefile will compile it)
- `Makefile` - Handles all compilation
- `README.txt` - Instructions
- `build.bat` - Windows compatibility

**Do NOT provide:**
- `main_fixed.cpp` - The solution
- `solution.md` - Solution documentation
- `deployment.md` - This file

### Create README.txt for Participants

```txt
Fix Me C++ Challenge
===================

You are given a C++ file with buggy functions and a pre-compiled test oracle.
Your task is to fix the bugs in the functions to make the oracle output the flag.

Files provided:
- main.cpp: Contains buggy functions that need to be fixed
- oracle.o: Pre-compiled test program

Instructions:
1. Analyze the functions in main.cpp and identify the bugs
2. Fix the bugs in the functions
3. Compile your fixed code: g++ -c -o functions.o main.cpp
4. Link with the oracle: g++ -o test oracle.o functions.o
5. Run the test: ./test
6. If all tests pass, you'll get the flag!

Hint: Look carefully at loop conditions and boundary cases.

Good luck!
```

### Directory Structure for Deployment

**Option 1: Pre-compiled Oracle**
```
fix-me-cpp1/
├── main.cpp          # Buggy functions (distribute)
├── oracle.o          # Compiled oracle (distribute)  
├── README.txt        # Instructions (distribute)
├── Makefile          # Build system (distribute)
└── build.bat         # Windows helper (distribute)
```

**Option 2: Makefile Approach (Recommended)**
```
fix-me-cpp1/
├── main.cpp          # Buggy functions (distribute)
├── oracle.cpp        # Oracle source (distribute)
├── README.txt        # Instructions (distribute)  
├── Makefile          # Build system (distribute)
└── build.bat         # Windows helper (distribute)
```

### Alternative: Single Binary Approach

If you prefer to give participants a single executable oracle that they link against:

```bash
# Create a shared library from oracle
g++ -shared -fPIC -o oracle.so oracle.cpp

# Participants would then compile:
g++ -c main.cpp -o functions.o
g++ -o test functions.o oracle.so
```

### Verification Commands

**Using Makefile (Recommended):**
```bash
# Test broken version
make test-broken

# Test fixed version  
make test-fixed

# Clean up
make clean
```

**Manual verification:**
```bash
# Quick verification script
echo "Testing broken version..."
g++ -c main.cpp -o functions_broken.o
g++ -o test_broken oracle.o functions_broken.o
./test_broken

echo ""
echo "Testing fixed version..."  
g++ -c main_fixed.cpp -o functions_fixed.o
g++ -o test_fixed oracle.o functions_fixed.o
./test_fixed
```