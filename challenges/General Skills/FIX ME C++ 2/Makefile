# Fix Me C++ Challenge 2 - MEDIUM DIFFICULTY Makefile
# ===================================================

# Compiler settings
CXX = g++
CXXFLAGS = -Wall -Wextra -std=c++11 -g
OBJDIR = obj
BINDIR = bin

# Create directories if they don't exist
$(shell mkdir -p $(OBJDIR) $(BINDIR))

# Default target - what participants will run
all: test

# Compile participant's functions and create test executable
# This assumes oracle.o already exists (pre-compiled by organizers)
test: $(OBJDIR)/functions.o oracle.o
	@echo "Linking test executable..."
	$(CXX) $(CXXFLAGS) $(OBJDIR)/functions.o oracle.o -o test
	@echo "Build complete! Run './test' to check your solution."

# Compile participant's main.cpp
$(OBJDIR)/functions.o: main.cpp
	@echo "Compiling your functions..."
	$(CXX) $(CXXFLAGS) -c main.cpp -o $(OBJDIR)/functions.o

# ORGANIZER TARGETS (for challenge setup)
# Compile the oracle (for organizers only)
oracle: oracle.o
	@echo "Oracle compiled successfully!"

oracle.o: oracle.cpp
	@echo "Compiling oracle..."
	$(CXX) $(CXXFLAGS) -c oracle.cpp -o oracle.o

# Test targets for organizers
test-broken: $(OBJDIR)/functions_broken.o oracle.o
	@echo "Testing broken version..."
	$(CXX) $(CXXFLAGS) $(OBJDIR)/functions_broken.o oracle.o -o test_broken
	@echo "Running broken version (expect failures):"
	./test_broken

test-fixed: $(OBJDIR)/functions_fixed.o oracle.o
	@echo "Testing fixed version..."
	$(CXX) $(CXXFLAGS) $(OBJDIR)/functions_fixed.o oracle.o -o test_fixed
	@echo "Running fixed version (should show flag):"
	./test_fixed

$(OBJDIR)/functions_broken.o: main.cpp
	$(CXX) $(CXXFLAGS) -c main.cpp -o $(OBJDIR)/functions_broken.o

$(OBJDIR)/functions_fixed.o: main_fixed.cpp
	$(CXX) $(CXXFLAGS) -c main_fixed.cpp -o $(OBJDIR)/functions_fixed.o

# Run the test with memory checking
run: test
	@echo "Running your solution..."
	./test

# Memory check (if valgrind is available)
memcheck: test
	@echo "Running with memory checking..."
	@if command -v valgrind >/dev/null 2>&1; then \
		valgrind --leak-check=full --show-leak-kinds=all ./test; \
	else \
		echo "Valgrind not found, running without memory checking..."; \
		./test; \
	fi

# Clean up generated files (participant version - preserves oracle.o)
clean:
	@echo "Cleaning up participant files..."
	rm -rf $(OBJDIR)
	rm -f test test.exe

# Clean up ALL files including oracle (organizer only)
clean-all:
	@echo "Cleaning up all files..."
	rm -rf $(OBJDIR) $(BINDIR)
	rm -f test test_broken test_fixed *.o *.exe

# Help target
help:
	@echo "Fix Me C++ Challenge 2 - MEDIUM DIFFICULTY"
	@echo "=========================================="
	@echo ""
	@echo "For Participants:"
	@echo "  make          - Compile your solution and create test executable"
	@echo "  make run      - Compile and run your solution"
	@echo "  make memcheck - Run with memory leak detection (if valgrind available)"
	@echo "  make clean    - Clean up your files (preserves oracle.o)"
	@echo ""
	@echo "For Organizers:"
	@echo "  make oracle      - Compile the oracle (do this once before distributing)"
	@echo "  make test-broken - Test with broken version (should fail)"
	@echo "  make test-fixed  - Test with fixed version (should show flag)"
	@echo "  make clean-all   - Clean up ALL files including oracle"
	@echo ""
	@echo "Setup Instructions for Organizers:"
	@echo "1. Run 'make oracle' to compile oracle.o"
	@echo "2. Distribute main.cpp, oracle.o, Makefile, and README.txt to participants"
	@echo "3. Participants run 'make' and 'make run' to test their solutions"
	@echo ""
	@echo "Usage for Participants:"
	@echo "1. Fix ALL the bugs in main.cpp (logic, boundary errors)"
	@echo "2. Run 'make' to compile"
	@echo "3. Run './test' or 'make run' to test your solution"

# Declare phony targets
.PHONY: all oracle test test-broken test-fixed run memcheck clean clean-all help