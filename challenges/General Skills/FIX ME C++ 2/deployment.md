# Fix Me C++ Challenge 2 - Deployment Guide (UPDATED)

## For Challenge Organizers

### Pre-Competition Setup (IMPORTANT)

1. **Compile the Oracle FIRST**
   ```bash
   # Navigate to the challenge directory
   cd "challenges/General Skills/FIX ME C++ 2"
   
   # Compile the oracle (do this ONCE before distributing)
   make oracle
   # OR manually: g++ -std=c++11 -c oracle.cpp -o oracle.o
   ```

2. **Test the Challenge**
   ```bash
   # Test broken version (should show failures)
   make test-broken
   
   # Test fixed version (should show flag)
   make test-fixed
   ```

### Files to Distribute to Participants

**Distribute these files:**
- `main.cpp` - The buggy functions to fix
- `oracle.o` - **Pre-compiled oracle object file** (CRITICAL!)
- `Makefile` - Build system with participant-safe targets
- `README.txt` - Updated instructions
- `build.bat` - Windows compatibility script

**Do NOT distribute:**
- `oracle.cpp` - Oracle source code
- `main_fixed.cpp` - The solution
- `solution.md` - Solution documentation
- `deployment.md` - This file

### Directory Structure for Distribution
```
fix-me-cpp2/
├── main.cpp          # Buggy functions (distribute)
├── oracle.o          # Pre-compiled oracle (distribute - REQUIRED!)
├── Makefile          # Build system (distribute)
├── README.txt        # Instructions (distribute)
└── build.bat         # Windows helper (distribute)
```

### Participant Workflow
1. **Fix bugs** in `main.cpp`
2. **Build**: `make` (or `build.bat` on Windows)
3. **Test**: `./test` (or `test.exe`)
4. **Clean**: `make clean` (preserves oracle.o!)

### Organizer Commands

**Setup Commands:**
```bash
make oracle       # Compile oracle.o (do this first!)
make test-broken  # Verify broken version fails
make test-fixed   # Verify fixed version succeeds
```

**Maintenance Commands:**
```bash
make clean-all    # Clean everything (including oracle.o)
make help         # Show all available targets
```

### Key Improvements

✅ **Oracle Preservation**: `make clean` no longer deletes `oracle.o`  
✅ **Separate Targets**: Different clean targets for participants vs organizers  
✅ **Clear Instructions**: Updated help and README  
✅ **Cross-Platform**: Works with make, mingw32-make, and manual compilation  
✅ **Error Handling**: build.bat checks for oracle.o existence  

### Troubleshooting

**Problem**: "oracle.o not found"  
**Solution**: Organizers must run `make oracle` before distributing files

**Problem**: Participants accidentally delete oracle.o  
**Solution**: Re-run `make oracle` and redistribute oracle.o

**Problem**: Make not available on Windows  
**Solution**: Use `build.bat` which falls back to manual compilation

### Verification Script

```bash
#!/bin/bash
# Quick verification for organizers
echo "Setting up challenge..."
make oracle

echo "Testing broken version..."
make test-broken

echo "Testing fixed version..."
make test-fixed

echo "Challenge ready for distribution!"
```

This new structure ensures that participants cannot accidentally break the challenge by deleting the oracle, while still providing them with a clean and easy build process.