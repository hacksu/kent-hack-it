# Fix Me C++ Challenge Makefile
# =============================

# Compiler settings
CXX = g++
CXXFLAGS = -Wall -Wextra -std=c++98
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

# ORGANIZER TARGETS (for challenge setup)
# Compile the oracle (for organizers only)
oracle: oracle.o
	@echo "Oracle compiled successfully!"

oracle.o: oracle.cpp
	@echo "Compiling oracle..."
	$(CXX) $(CXXFLAGS) -c oracle.cpp -o oracle.o

# Compile participant's main.cpp
$(OBJDIR)/functions.o: main.cpp
	@echo "Compiling your functions..."
	$(CXX) $(CXXFLAGS) -c main.cpp -o $(OBJDIR)/functions.o

# Test targets for organizers
test-broken: $(OBJDIR)/functions_broken.o oracle.o
	@echo "Testing broken version..."
	$(CXX) $(CXXFLAGS) $(OBJDIR)/functions_broken.o oracle.o -o test_broken
	./test_broken

test-fixed: $(OBJDIR)/functions_fixed.o oracle.o
	@echo "Testing fixed version..."
	$(CXX) $(CXXFLAGS) $(OBJDIR)/functions_fixed.o oracle.o -o test_fixed
	./test_fixed

$(OBJDIR)/functions_broken.o: main.cpp
	$(CXX) $(CXXFLAGS) -c main.cpp -o $(OBJDIR)/functions_broken.o

$(OBJDIR)/functions_fixed.o: main_fixed.cpp
	$(CXX) $(CXXFLAGS) -c main_fixed.cpp -o $(OBJDIR)/functions_fixed.o

# Run the test
run: test
	@echo "Running your solution..."
	./test

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
	@echo "Fix Me C++ Challenge - Makefile Help"
	@echo "===================================="
	@echo ""
	@echo "For Participants:"
	@echo "  make          - Compile your solution and create test executable"
	@echo "  make run      - Compile and run your solution"
	@echo "  make clean    - Clean up generated files (preserves oracle.o)"
	@echo ""
	@echo "For Organizers:"
	@echo "  make oracle      - Compile just the oracle"
	@echo "  make test-broken - Test with broken version (should fail)"
	@echo "  make test-fixed  - Test with fixed version (should show flag)"
	@echo "  make clean-all   - Remove all files including oracle"
	@echo ""
	@echo "Usage:"
	@echo "1. Fix the bugs in main.cpp"
	@echo "2. Run 'make' to compile"
	@echo "3. Run './test' or 'make run' to test your solution"

# Declare phony targetsmake 
.PHONY: all oracle test test-broken test-fixed run clean help