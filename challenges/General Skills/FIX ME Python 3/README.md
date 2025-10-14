# Fix Me Python 3 Challenge - Hard Difficulty

## Overview
This is an advanced-level Python debugging challenge that tests mastery of sophisticated Python concepts. You are given complex implementations with subtle bugs that require deep understanding of Python's advanced features and best practices.

## Files provided:
- `main.py`: Contains buggy functions and classes that need to be fixed
- `oracle.pyc`: Compiled test program that checks your fixes (cannot be modified)

## Instructions:

1. **Analyze the code** in `main.py` and identify the subtle bugs
2. **Fix the bugs** while maintaining the intended functionality
3. **Run the oracle**: `python oracle.pyc`
4. If all tests pass, you'll get the flag!

## Components to Fix:

### `@memoize` Decorator
A caching decorator that should handle function memoization. Bug involves handling unhashable argument types.

### `BinarySearchTree` Class
Object-oriented binary search tree implementation. Issues with duplicate handling and search method return values.

### `fibonacci_generator()` Function
Generator function for Fibonacci sequences. Off-by-one error in the generation logic.

### `CustomList` Class
Custom list implementation with magic methods. Type checking problems in `__add__` and `__eq__` methods.

### `@file_manager` Context Manager
Context manager for safe file operations. Exception handling and resource cleanup issues.

### `dijkstra_shortest_path()` Function
Implementation of Dijkstra's shortest path algorithm. Performance issues and edge case handling problems.

### `LazyEvaluator` Class
Lazy evaluation pattern implementation. Memory management and method behavior bugs.

### `advanced_sort()` Function
Advanced sorting with custom parameters. Mutability and side-effect issues.

## Challenge Level: Hard

This challenge tests mastery of:

### **Object-Oriented Programming**
- Class design and inheritance
- Magic methods (`__add__`, `__eq__`, etc.)
- Property decorators and encapsulation

### **Advanced Python Features**
- **Decorators**: Function wrapping and metadata preservation
- **Generators**: Yield statements and iteration protocols  
- **Context Managers**: `with` statements and resource management
- **Exception Handling**: Try/except/finally patterns

### **Algorithm Implementation**
- **Graph Algorithms**: Dijkstra's shortest path
- **Data Structures**: Binary search trees, custom collections
- **Performance Optimization**: Time/space complexity considerations

### **Python Best Practices**
- **Immutability**: Avoiding unintended side effects
- **Type Safety**: Proper type checking and handling
- **Memory Management**: Preventing memory leaks
- **Error Handling**: Graceful failure modes

## Debugging Strategy:

1. **Read the Tests**: Understand what each function/class should do
2. **Trace Execution**: Follow the code path for failing test cases
3. **Check Edge Cases**: Empty inputs, None values, type mismatches
4. **Consider Side Effects**: Does the function modify its inputs?
5. **Validate Types**: Are you handling all possible input types?
6. **Review Algorithms**: Is the algorithm implementation correct?
7. **Test Incrementally**: Fix one bug at a time and re-test

## Common Advanced Pitfalls:

- **Unhashable Types**: Lists and dicts can't be dictionary keys
- **Generator Boundaries**: Off-by-one errors in iteration counts
- **Type Assumptions**: Not all inputs will be the expected type
- **Resource Cleanup**: Files and connections need proper closing
- **Algorithm Correctness**: Classic CS algorithms have well-known patterns
- **Mutability Issues**: Functions shouldn't modify their arguments unexpectedly

## Testing:
Run `python oracle.pyc` to test your fixes. The oracle provides detailed feedback on each component and will guide you to the specific issues.

## Expected Output:
When all components are fixed correctly, you should see:
```
🎉 ALL TESTS PASSED! 🎉
You have mastered advanced Python debugging!
FLAG: khi{python_expert_level3_[number]}
```

## Difficulty Progression:
- **Level 1**: Basic Python syntax and logic
- **Level 2**: Algorithms and intermediate concepts  
- **Level 3** (This challenge): Advanced OOP, design patterns, and complex algorithms

This challenge represents mastery-level Python debugging skills. Good luck!

## Hints:
- **Decorators**: Think about what happens when arguments aren't hashable
- **OOP**: Consider type checking before accessing attributes
- **Generators**: Count your iterations carefully
- **Context Managers**: What happens when the `try` block fails?
- **Algorithms**: Review the classical implementations
- **Immutability**: Should functions modify their inputs?