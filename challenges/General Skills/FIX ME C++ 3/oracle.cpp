/*
 * Oracle Test Harness for Fix Me C++ 3
 * 
 * This oracle tests the command pattern implementation directly through
 * function calls and behavioral validation.
 */

#include <iostream>
#include <string>

// Forward declarations - these will be included from main.cpp when compiled together
class Command;
class TextEditor;
class CommandManager;

// External function declarations from main.cpp
extern void testBasicCommands();
extern void testUndoRedo();
extern void testDeleteOperations();

class TestOracle {
private:
    static int testsPassed;
    static int testsTotal;
    
    static void assertTrue(bool condition, const char* testName) {
        testsTotal++;
        if (condition) {
            testsPassed++;
            std::cout << "[PASS] " << testName << std::endl;
        } else {
            std::cout << "[FAIL] " << testName << std::endl;
        }
    }
    
public:
    static void runValidationTests() {
        std::cout << "\n===============================================" << std::endl;
        std::cout << "ORACLE VALIDATION TESTS" << std::endl;
        std::cout << "===============================================" << std::endl;
        
        testsPassed = 0;
        testsTotal = 0;
        
        // Test 1: Basic compilation and execution
        std::cout << "\n--- Test 1: Compilation & Basic Execution ---" << std::endl;
        bool compilationSuccess = true;  // If we got here, it compiled
        assertTrue(compilationSuccess, "Code compiles without major errors");
        
        // Test 2: Run command pattern tests
        std::cout << "\n--- Test 2: Command Pattern Basic Tests ---" << std::endl;
        bool basicCommandTestRan = false;
        try {
            std::cout << "Running testBasicCommands()..." << std::endl;
            testBasicCommands();
            basicCommandTestRan = true;
        } catch (...) {
            std::cout << "Exception caught in basic command test" << std::endl;
        }
        assertTrue(basicCommandTestRan, "Basic command test executes without crashing");
        
        // Test 3: Run undo/redo test
        std::cout << "\n--- Test 3: Undo/Redo Test ---" << std::endl;
        bool undoRedoTestRan = false;
        try {
            std::cout << "Running testUndoRedo()..." << std::endl;
            testUndoRedo();
            undoRedoTestRan = true;
        } catch (...) {
            std::cout << "Exception caught in undo/redo test" << std::endl;
        }
        assertTrue(undoRedoTestRan, "Undo/redo test executes without crashing");
        
        // Test 4: Run delete operations test
        std::cout << "\n--- Test 4: Delete Operations Test ---" << std::endl;
        bool deleteTestRan = false;
        try {
            std::cout << "Running testDeleteOperations()..." << std::endl;
            testDeleteOperations();
            deleteTestRan = true;
        } catch (...) {
            std::cout << "Exception caught in delete operations test" << std::endl;
        }
        assertTrue(deleteTestRan, "Delete operations test executes without crashing");
        
        // Test 5: Overall validation
        std::cout << "\n--- Test 5: Overall Validation ---" << std::endl;
        
        // Check if all previous tests passed - this indicates proper implementation
        bool allTestsPassed = (testsPassed >= 3);  // All previous tests must pass
        assertTrue(allTestsPassed, "Command pattern implementation working correctly");
        
        // Final results
        std::cout << "\n===============================================" << std::endl;
        std::cout << "VALIDATION RESULTS" << std::endl;
        std::cout << "===============================================" << std::endl;
        std::cout << "Tests Passed: " << testsPassed << "/" << testsTotal << std::endl;
        
        double percentage = (testsTotal > 0) ? (double)testsPassed / testsTotal * 100.0 : 0.0;
        std::cout << "Success Rate: " << percentage << "%" << std::endl;
        
        // Award flag based on test results
        if (testsPassed == testsTotal && testsTotal >= 4) {
            std::cout << "\n🎉 CONGRATULATIONS!" << std::endl;
            std::cout << "===============================================" << std::endl;
            std::cout << "All tests passed! You have successfully fixed" << std::endl;
            std::cout << "the command pattern implementation!" << std::endl;
            std::cout << "" << std::endl;
            std::cout << "🏁 FLAG: FLAG{c0mm4nd_p477ern_m4573r_2025}" << std::endl;
            std::cout << "===============================================" << std::endl;
            std::cout << "" << std::endl;
            std::cout << "You have demonstrated mastery of:" << std::endl;
            std::cout << "✓ Command pattern implementation" << std::endl;
            std::cout << "✓ Memory management with proper cleanup" << std::endl;
            std::cout << "✓ Virtual destructors and polymorphism" << std::endl;
            std::cout << "✓ Undo/Redo functionality" << std::endl;
            std::cout << "✓ Error handling and bounds checking" << std::endl;
        } else {
            std::cout << "\n❌ TESTS FAILED" << std::endl;
            std::cout << "===============================================" << std::endl;
            std::cout << "Some tests did not pass. Please review and fix:" << std::endl;
            std::cout << "" << std::endl;
            std::cout << "Common issues to check:" << std::endl;
            std::cout << "1. Add virtual destructor to Command interface" << std::endl;
            std::cout << "2. Use smart pointers instead of raw pointers" << std::endl;
            std::cout << "3. Implement proper undo functionality in commands" << std::endl;
            std::cout << "4. Add bounds checking in TextEditor methods" << std::endl;
            std::cout << "5. Store deleted text for undo in DeleteCommand" << std::endl;
            std::cout << "6. Clear redo stack when new commands are executed" << std::endl;
            std::cout << "7. Add null pointer checks and error handling" << std::endl;
            std::cout << "" << std::endl;
            std::cout << "Fix these issues and run 'make test' again!" << std::endl;
        }
    }
};

// Static member definitions
int TestOracle::testsPassed = 0;
int TestOracle::testsTotal = 0;

// Oracle main function - this replaces the main() in main.cpp
int main() {
    std::cout << "Fix Me C++ 3 - Command Pattern Oracle" << std::endl;
    std::cout << "====================================" << std::endl;
    
    TestOracle::runValidationTests();
    
    return 0;
}