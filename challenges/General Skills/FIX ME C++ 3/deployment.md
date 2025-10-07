# Fix Me C++ 3 - Deployment Guide# Fix Me C++ 3 - Deployment Guide

## Command Pattern & Memory Management Challenge

## Pre-Deployment Setup

### Overview

This deployment guide covers the setup and deployment of the "Fix Me C++ 3" challenge, which focuses on command pattern implementation and memory management in C++.### 1. Compile Oracle

Before deploying to participants, compile the oracle:

**Challenge Details:**

- **Difficulty:** Hard```bash

- **Category:** Design Patterns & Memory Management  cd "challenges/General Skills/FIX ME C++ 3"

- **Points:** 100make oracle

- **Flag:** `FLAG{c0mm4nd_p477ern_m4573r_2024}````

- **Focus:** Command Pattern, Virtual Destructors, Smart Pointers, Undo/Redo Systems

This creates `oracle.o` which participants will receive.

---

### 2. Verify Challenge Works

## Pre-Deployment ChecklistTest both broken and fixed versions:



### Required Files```bash

Ensure all these files are present in the challenge directory:# Test broken version (should show failing tests)

make test-broken

```

challenges/General Skills/FIX ME C++ 3/# Test fixed version (should show flag)

├── main.cpp           # Buggy source code (24+ intentional bugs)make test-fixed

├── main_fixed.cpp     # Fixed solution (for validation)```

├── oracle.cpp         # Test harness and validation system

├── Makefile           # Build system with participant/organizer targets### 3. Package for Participants

├── README.md          # Challenge description and instructionsParticipants should receive:

└── solution.md        # Detailed solution guide (organizer reference)- `main.cpp` (buggy version)

```- `oracle.cpp` (basic oracle source - needed for compilation)

- `advanced_oracle.cpp` (advanced oracle source - needed for validation)

### System Requirements- `Makefile`

- **Compiler:** g++ with C++11 support or newer- `README.txt`

- **Platform:** Linux/Unix, macOS, Windows (with appropriate make)

- **Dependencies:** Standard C++ library only (no external dependencies)**DO NOT include:**

- `main_fixed.cpp` (solution)

---- `solution.md` (solution guide)

- `deployment.md` (this file)

## Deployment Steps

## Directory Structure for Deployment

### 1. File Preparation

```

**For Participants (Public Deployment):**FIX ME C++ 3/

```bash├── main.cpp             # ✅ Participant gets this (buggy code)

# Files to include in participant package:├── oracle.cpp           # ✅ Participant gets this (basic oracle)

main.cpp      # Buggy implementation├── advanced_oracle.cpp  # ✅ Participant gets this (advanced oracle)

oracle.cpp    # Pre-compiled or source (see Oracle Strategy below)├── Makefile             # ✅ Participant gets this (build system)

Makefile      # Build system├── README.txt           # ✅ Participant gets this (instructions)

README.md     # Instructions├── main_fixed.cpp       # ❌ Organizer only (solution)

```├── solution.md          # ❌ Organizer only (solution guide)

└── deployment.md        # ❌ Organizer only (this file)

**For Organizers (Full Package):**```

```bash

# Additional files for organizers:## Build System Features

main_fixed.cpp    # Reference solution

solution.md       # Detailed solution guide### Participant Commands

deployment.md     # This guide- `make` - Compile and test with BOTH oracles (basic + advanced)

```- `make run` - Same as make

- `make clean` - Clean files (preserves oracle files)

### 2. Oracle Deployment Strategy- `make help` - Show available commands



You have two deployment options for the oracle:### Organizer Commands  

- `make oracle` - Compile basic oracle from source

#### Option A: Source Code Oracle (Recommended)- `make test-broken` - Test buggy version with both oracles

- **Pros:** Easier deployment, no binary compatibility issues- `make test-fixed` - Test fixed version with both oracles

- **Cons:** Participants can read oracle source- `make advanced-check` - Run only the advanced oracle

- **Files:** Include both `main.cpp` and `oracle.cpp`- `make clean-all` - Remove ALL files including oracles



#### Option B: Pre-compiled Oracle  ### Oracle Preservation

- **Pros:** Oracle logic hidden from participantsThe Makefile is designed to protect the oracle:

- **Cons:** Platform-specific binaries needed- `make clean` preserves `oracle.o` for participants

- **Setup:**- `make clean-all` removes everything (organizer only)

```bash- Oracle rebuilding requires source code (organizer only)

# Pre-compile oracle for target platform

g++ -std=c++11 -c oracle.cpp -o oracle.o## Challenge Validation



# Include in participant package:### Expected Behavior - Broken Version

main.cpp     # Source to fixWhen participants run the buggy code:

oracle.o     # Pre-compiled oracle- Multiple tests should fail

Makefile     # Updated to link with oracle.o- Singleton violations detected

```- Memory management issues

- Edge cases not handled properly

### 3. Testing Before Deployment- **No flag displayed**



**Test Broken Version:**### Expected Behavior - Fixed Version  

```bashWhen code is properly fixed:

cd "challenges/General Skills/FIX ME C++ 3"- All tests pass (100% success rate)

make test-broken- Singleton behavior correct

```- Memory management clean

Expected output: Tests should fail, showing guidance messages- Edge cases handled

- **Flag displayed: `FLAG{5ing1370n_p477ern_m4573r_2024}`**

**Test Fixed Version:**

```bash## Cross-Platform Support

make test-fixed  

```The Makefile supports:

Expected output: All tests pass, flag awarded: `FLAG{c0mm4nd_p477ern_m4573r_2024}`- **Linux/macOS** - Native g++ compilation

- **Windows** - MinGW/MSYS2 g++ compilation  

**Clean Build Test:**- **Windows PowerShell** - Proper path handling

```bash

make clean-all### Windows-Specific Notes

make test- Executables get `.exe` extension automatically

```- File deletion uses `del /Q` command

Should compile and run with broken version- Directory creation uses `mkdir` command



---## Debugging Common Issues



## Platform-Specific Deployment### Oracle Not Found

If participants get "oracle.o not found":

### Linux/Unix Systems1. Verify `oracle.o` was included in deployment package

```bash2. Check file permissions (should be readable)

# Standard deployment - no special requirements3. Ensure Makefile is in same directory

cp -r "FIX ME C++ 3" /path/to/challenges/

chmod +x Makefile### Compilation Errors

```If participants get compilation errors:

1. Verify they have g++ with C++11 support

### macOS2. Check for syntax errors they introduced

```bash3. Ensure they didn't modify oracle-related parts

# May need to install command line tools

xcode-select --install### Tests Not Running

If oracle tests don't execute:

# Deploy normally1. Check executable permissions on generated binary

cp -r "FIX ME C++ 3" /path/to/challenges/2. Verify oracle.o is valid and not corrupted

```3. Ensure platform compatibility (32-bit vs 64-bit)



### Windows (WSL/MinGW)## Security Considerations

```bash

# Ensure Windows line endings are converted### Source Code Protection

dos2unix *.cpp *.h Makefile 2>/dev/null || true- Oracle source code (`oracle.cpp`) contains test logic

- Solution code (`main_fixed.cpp`) shows all answers

# Deploy to accessible location- Keep these files secure from participants

cp -r "FIX ME C++ 3" /mnt/c/challenges/

```### Flag Security

- Flag is embedded in oracle.o binary

### Docker Deployment (Recommended)- Participants need to fix code to reveal it legitimately

```dockerfile- Binary analysis might reveal flag, but that's advanced

FROM gcc:11

## Difficulty Assessment

WORKDIR /challenges

COPY "FIX ME C++ 3" ./fix-me-cpp-3/### Challenge Classification

- **Difficulty:** Hard

# Install make if needed- **Expected Time:** 45-90 minutes

RUN apt-get update && apt-get install -y make- **Prerequisites:** 

  - Advanced C++ knowledge

# Set working directory  - Design pattern understanding

WORKDIR /challenges/fix-me-cpp-3  - Memory management concepts

  - Debugging experience

# Test deployment

RUN make test-broken && echo "Broken version test complete"### Learning Objectives

RUN make test-fixed && echo "Fixed version test complete" Participants will learn:

RUN make clean- Proper singleton pattern implementation

- Modern C++ best practices (C++11+)

# Entry point for participants- Const-correctness principles

CMD ["bash"]- Safe container access patterns

```- Memory management techniques

- Copy semantics and prevention

---

## Variations and Extensions

## Verification & Testing

### Possible Modifications

### 1. Functionality Tests1. **Add threading bugs** - Require thread-safe implementation

```bash2. **Use different patterns** - Observer, Factory, etc.

# Test 1: Compilation3. **Add more complexity** - Template singletons, CRTP

make clean && make test4. **Memory debugging** - Require valgrind-clean solution

# Should compile without errors

### Scaling Difficulty

# Test 2: Oracle behavior  - **Easier:** Remove some bugs, add more hints

./test- **Harder:** Add threading, templates, or multiple patterns

# Should show failed tests with guidance- **Advanced:** Require specific singleton variant (CRTP, etc.)



# Test 3: Fixed solution## Post-Challenge Analysis

make test-fixed

# Should show all tests pass with flagAfter the CTF, consider:

```1. Tracking common mistakes made by participants

2. Analyzing which bugs were hardest to find

### 2. Build System Tests3. Gathering feedback on difficulty level

```bash4. Updating challenge based on participant performance

# Test all Makefile targets

make help           # Show helpThis challenge provides excellent practice with advanced C++ concepts while remaining achievable for experienced programmers.
make oracle         # Compile oracle only  
make clean          # Clean participant files
make clean-all      # Clean all files
```

### 3. Bug Validation
Verify the main.cpp contains these intentional bugs:
- [ ] Missing virtual destructor in Command class
- [ ] Raw pointers instead of smart pointers
- [ ] Improper undo/redo implementation
- [ ] Missing bounds checking in TextEditor
- [ ] Memory leaks in command execution
- [ ] Missing error handling and null checks

### 4. Security Check
```bash
# Ensure no sensitive information in participant files
grep -r "FLAG{" main.cpp README.md Makefile
# Should return no results

# Check for solution hints
grep -r "fix\|solution\|answer" main.cpp
# Should only return educational comments
```

---

## Participant Instructions

### Challenge Setup
1. **Download/Clone** challenge files to local environment
2. **Navigate** to the "FIX ME C++ 3" directory
3. **Read** the README.md for challenge details
4. **Test** initial state: `make test`

### Working Process
1. **Analyze** the buggy code in main.cpp
2. **Identify** command pattern bugs and memory issues
3. **Fix** bugs incrementally
4. **Test** frequently: `make test`
5. **Submit** when oracle shows flag

### Getting Help
```bash
make help           # Show Makefile usage
# Read README.md     # Challenge instructions
# Review oracle output for specific guidance
```

---

## Organizer Management

### Monitoring Progress
- Watch for participants running `make test` frequently
- Monitor compile errors vs logic errors
- Look for creative solutions that differ from main_fixed.cpp

### Providing Hints
If participants are stuck, provide progressive hints:
1. **Level 1:** "Focus on virtual destructors in base classes"
2. **Level 2:** "Consider using smart pointers for automatic memory management"
3. **Level 3:** "The undo system needs to store original text"

### Validation
Use the solution guide (solution.md) to verify participant solutions are correct.

---

## Troubleshooting

### Common Deployment Issues

**Issue: Compilation errors on deployment**
```bash
# Solution: Check compiler version and flags
g++ --version
# Ensure C++11 or newer support
```

**Issue: Oracle not finding functions**
```bash
# Solution: Verify main.cpp has test functions
grep -n "testBasicCommands\|testUndoRedo\|testDeleteOperations" main.cpp
```

**Issue: Make command not found**
```bash
# Linux/macOS
sudo apt-get install build-essential  # Ubuntu/Debian
sudo yum install gcc-c++ make         # CentOS/RHEL
brew install make                      # macOS

# Windows
# Install MinGW or use WSL
```

**Issue: Platform-specific build failures**
```bash
# Solution: Use Docker for consistent environment
docker build -t fixme-cpp3 .
docker run -it fixme-cpp3
```

### Performance Issues
- If compilation is slow, reduce optimization: Change `-O2` to `-O0` in Makefile
- For large deployments, pre-compile oracle.o files for each platform

---

## Security Considerations

### Flag Protection
- ✅ Flag only displayed when all bugs are fixed
- ✅ Flag not present in participant source files
- ✅ Oracle validates actual fixes, not superficial changes

### Sandboxing (Recommended)
```bash
# Run in restricted environment
# Limit memory usage
ulimit -m 100000  # 100MB memory limit

# Limit execution time  
timeout 30s make test
```

### Code Review
- Regularly review participant submissions for unintended solutions
- Watch for hardcoded flag attempts
- Monitor for attempts to bypass oracle validation

---

## Maintenance & Updates

### Regular Checks
- [ ] Verify all test cases still pass with main_fixed.cpp
- [ ] Update compiler flags if needed for newer systems
- [ ] Check for new C++ standard compatibility

### Feedback Integration
- Monitor participant feedback on difficulty level
- Adjust hint messages in oracle if too many get stuck
- Consider adding more progressive test cases

### Version Control
- Keep deployment.md updated with any changes
- Document any bug fixes or improvements
- Maintain compatibility with older systems

---

## Support & Resources

### For Participants
- Challenge README.md contains all necessary instructions
- Oracle provides specific guidance when tests fail
- Makefile help target shows all available commands

### For Organizers  
- solution.md contains complete bug analysis and fixes
- This deployment guide covers all setup scenarios
- Oracle can be modified to adjust difficulty

### Contact
For deployment issues or questions about this challenge, refer to the CTF organizing team or the challenge author.

---

**Deployment Checklist:**
- [ ] All required files present
- [ ] Test broken version (should fail gracefully)
- [ ] Test fixed version (should award flag)
- [ ] Verify Makefile targets work
- [ ] Check platform compatibility
- [ ] Security review completed
- [ ] Participant instructions clear
- [ ] Backup of all files created

**Challenge Status: Ready for Deployment** ✅