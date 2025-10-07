# Fix Me C++ 3 - Hard Level Challenge Makefile
# Command Pattern & Memory Management
#
# This Makefile supports the oracle-based testing system where participants
# receive the buggy code and a pre-compiled oracle for testing.

# Compiler and flags
CXX = g++
CXXFLAGS = -std=c++11 -Wall -Wextra -pedantic -O2

# Directories
OBJDIR = obj
BINDIR = bin

# Source files
MAIN_SRC = main.cpp
ORACLE_SRC = oracle.cpp
FIXED_SRC = main_fixed.cpp

# Object files
ORACLE_OBJ = oracle.o

# Executables
TEST_EXE = test
TEST_BROKEN_EXE = test_broken
TEST_FIXED_EXE = test_fixed

# Default target for participants
all: test

# Participant target - build and run their solution with oracle
test: $(ORACLE_SRC) $(MAIN_SRC)
	@echo "Compiling participant solution..."
	$(CXX) $(CXXFLAGS) -DORACLE_BUILD -o $(TEST_EXE) $(MAIN_SRC) $(ORACLE_SRC)
	@echo "Running oracle tests..."
	./$(TEST_EXE)

# Organizer target - compile oracle (pre-deployment)
oracle: $(ORACLE_OBJ)

$(ORACLE_OBJ): $(ORACLE_SRC)
	@echo "Compiling oracle..."
	$(CXX) $(CXXFLAGS) -c $(ORACLE_SRC) -o $(ORACLE_OBJ)

# Organizer target - test broken version with oracle
test-broken: $(ORACLE_SRC) $(MAIN_SRC)
	@echo "Testing broken version with oracle..."
	$(CXX) $(CXXFLAGS) -DORACLE_BUILD -o $(TEST_BROKEN_EXE) $(MAIN_SRC) $(ORACLE_SRC)
	./$(TEST_BROKEN_EXE)

# Organizer target - test fixed version with oracle
test-fixed: $(ORACLE_SRC) $(FIXED_SRC)
	@echo "Testing fixed version with oracle..."
	$(CXX) $(CXXFLAGS) -DORACLE_BUILD -o $(TEST_FIXED_EXE) $(FIXED_SRC) $(ORACLE_SRC)
	./$(TEST_FIXED_EXE)



# Run target for participants
run: test

# Cross-platform support
ifeq ($(OS),Windows_NT)
    # Windows-specific settings
    TEST_EXE := $(TEST_EXE).exe
    TEST_BROKEN_EXE := $(TEST_BROKEN_EXE).exe
    TEST_FIXED_EXE := $(TEST_FIXED_EXE).exe
    RM = del /Q
    MKDIR = if not exist $(OBJDIR) mkdir $(OBJDIR) && if not exist $(BINDIR) mkdir $(BINDIR)
else
    # Unix-like systems (Linux, macOS)
    RM = rm -f
    MKDIR = mkdir -p $(OBJDIR) $(BINDIR)
endif

# Create directories if they don't exist
$(OBJDIR):
	$(MKDIR)

# Clean up generated files (participant version - preserves oracle files)
clean:
	@echo "Cleaning up participant files..."
	$(RM) $(TEST_EXE) 2>/dev/null || true
ifneq ($(OS),Windows_NT)
	rm -rf $(OBJDIR) 2>/dev/null || true
endif

# Clean up ALL files including oracle (organizer only)
clean-all:
	@echo "Cleaning up all files..."
	$(RM) $(TEST_EXE) $(TEST_BROKEN_EXE) $(TEST_FIXED_EXE) *.o 2>/dev/null || true
ifneq ($(OS),Windows_NT)
	rm -rf $(OBJDIR) $(BINDIR) 2>/dev/null || true
endif

# Help target
help:
	@echo "Fix Me C++ 3 Challenge - Makefile Help"
	@echo "====================================="
	@echo ""
	@echo "For Participants:"
	@echo "  make          - Compile and run with oracle"
	@echo "  make run      - Same as make"
	@echo "  make clean    - Clean up generated files (preserves oracle files)"
	@echo ""
	@echo "For Organizers:"
	@echo "  make oracle        - Compile just the oracle"
	@echo "  make test-broken   - Test broken version with oracle"
	@echo "  make test-fixed    - Test fixed version with oracle"
	@echo "  make clean-all     - Remove all files including oracles"
	@echo ""
	@echo "Oracle System:"
	@echo "  Oracle - Tests functionality and provides guidance"
	@echo ""
	@echo "Challenge Focus: Command Pattern & Memory Management"
	@echo "Difficulty: Hard"

# Phony targets
.PHONY: all test oracle test-broken test-fixed run clean clean-all help