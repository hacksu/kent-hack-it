# Fix Me C++ 3 - Command Pattern Challenge

**Difficulty:** Hard  
**Category:** Design Patterns & Memory Management  
**Points:** 100  

## Challenge Description

Welcome to the hard C++ debugging challenge! This challenge focuses on the **Command Design Pattern** and proper memory management. You'll need to identify and fix multiple sophisticated bugs in a text editor system.

## Problem Statement

You've been given a text editor system that implements the command pattern for undo/redo functionality. The system includes `Command` interface, `TextEditor` receiver, `InsertCommand` and `DeleteCommand` concrete commands, and a `CommandManager` invoker. However, there are several critical bugs that prevent the system from working correctly:

- Improper command pattern implementation
- Memory management issues (leaks, dangling pointers)
- Missing virtual destructors and polymorphism bugs
- Incorrect undo/redo logic
- Bounds checking failures
- Design pattern violations

Your mission: Fix all the bugs to make the oracle tests pass and reveal the flag!

## What You Get

- `main.cpp` - The buggy source code you need to fix
- `oracle.cpp` - Test harness source (DO NOT MODIFY)
- `Makefile` - Build system for testing your solution

## What You Need To Do

1. **Analyze the code** - Read through `main.cpp` and understand the command pattern implementation
2. **Identify the bugs** - Look for memory leaks, missing virtual destructors, incorrect undo/redo logic
3. **Fix the issues** - Modify only `main.cpp` to correct all problems
4. **Test your solution** - Run `make` to compile and test your fixes
5. **Get the flag** - When all tests pass, the flag will be displayed!

## Running Your Solution

```bash
# Compile and test your solution
make

# Just compile without running
make test

# Clean up generated files (keeps oracle safe)
make clean

# Get help
make help
```

## Key Concepts to Review

### Command Pattern Components
- **Command Interface:** Abstract base with execute() and undo() methods
- **Receiver:** TextEditor that performs the actual operations  
- **Concrete Commands:** InsertCommand and DeleteCommand implementations
- **Invoker:** CommandManager that stores and manages command history

### Common Bug Categories in This Challenge
1. **Memory Management Bugs:**
   - Missing virtual destructors causing undefined behavior
   - Raw pointer usage leading to memory leaks
   - Improper cleanup in error conditions

2. **Command Pattern Bugs:**
   - Incorrect undo/redo implementation
   - Missing command state preservation
   - Improper polymorphism usage

3. **Bounds Checking:**
   - Array/string out-of-bounds access
   - Invalid position parameters
   - Edge case handling failures

4. **Error Handling:**
   - Missing exception handling
   - Improper error recovery
   - Resource cleanup on failures

## Hints

- Pay close attention to virtual destructors - they're crucial for proper polymorphism
- Smart pointers can help eliminate many memory management bugs
- Command pattern requires careful state management for undo/redo
- Always validate input parameters before using them
- Error handling should clean up resources properly

## Scoring

This challenge has **24+ intentional bugs** of varying complexity:
- **Critical bugs:** Missing virtual destructors, memory leaks, segmentation faults
- **Major bugs:** Incorrect undo/redo logic, improper error handling
- **Minor bugs:** Edge case failures, inefficient implementations

You need to fix **all bugs** to get the full points and flag!

## Tips for Success

1. **Use static analysis:** Modern compilers with warnings can catch many issues
2. **Test incrementally:** Fix one category of bugs at a time
3. **Understand the pattern:** Make sure you understand command pattern before starting
4. **Memory tools:** Consider using valgrind or similar tools to detect leaks
5. **Read carefully:** Each bug has been carefully placed - nothing is accidental

Good luck, and may your debugging skills be sharp! 🚀

---
*Remember: In CTF challenges, every detail matters. Read the code thoroughly and test all edge cases!*