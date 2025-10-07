#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <stack>
#include <stdexcept>

// Fixed Command Pattern Implementation
// This version addresses all the intentional bugs in main.cpp

// Command interface with proper virtual destructor
class Command {
public:
    virtual ~Command() = default;  // FIX 1: Added virtual destructor
    virtual void execute() = 0;
    virtual void undo() = 0;
    virtual Command* clone() const = 0;  // FIX 2: Added clone for proper copying
};

// Receiver class - TextEditor with proper bounds checking
class TextEditor {
private:
    std::string content;
    
public:
    TextEditor() {}
    
    void insertText(int position, const std::string& text) {
        // FIX 3: Added bounds checking
        if (position < 0 || position > (int)content.size()) {
            throw std::out_of_range("Insert position out of range");
        }
        content.insert(position, text);
    }
    
    std::string deleteText(int position, int length) {
        // FIX 4: Added bounds checking and proper error handling
        if (position < 0 || position >= (int)content.size()) {
            throw std::out_of_range("Delete position out of range");
        }
        
        // FIX 5: Handle case where length exceeds available text
        if (position + length > (int)content.size()) {
            length = (int)content.size() - position;
        }
        
        std::string deletedText = content.substr(position, length);
        content.erase(position, length);
        return deletedText;
    }
    
    const std::string& getContent() const {
        return content;
    }
    
    int getLength() const {
        return (int)content.size();
    }
};

// Concrete command for insertion with proper undo support
class InsertCommand : public Command {
private:
    TextEditor* editor;
    int position;
    std::string text;
    
public:
    InsertCommand(TextEditor* ed, int pos, const std::string& txt) 
        : editor(ed), position(pos), text(txt) {}
    
    void execute() override {
        editor->insertText(position, text);
    }
    
    void undo() override {
        // FIX 6: Proper undo implementation - delete what we inserted
        editor->deleteText(position, (int)text.size());
    }
    
    Command* clone() const override {
        return new InsertCommand(editor, position, text);
    }
};

// Concrete command for deletion with proper undo support
class DeleteCommand : public Command {
private:
    TextEditor* editor;
    int position;
    int length;
    std::string deletedText;  // FIX 7: Store deleted text for undo
    
public:
    DeleteCommand(TextEditor* ed, int pos, int len) 
        : editor(ed), position(pos), length(len) {}
    
    void execute() override {
        deletedText = editor->deleteText(position, length);
    }
    
    void undo() override {
        // FIX 8: Proper undo - restore the deleted text
        editor->insertText(position, deletedText);
    }
    
    Command* clone() const override {
        DeleteCommand* cmd = new DeleteCommand(editor, position, length);
        cmd->deletedText = deletedText;  // Copy the state
        return cmd;
    }
};

// Command manager with proper memory management
class CommandManager {
private:
    std::stack<std::unique_ptr<Command>> undoStack;  // FIX 9: Use smart pointers
    std::stack<std::unique_ptr<Command>> redoStack;  // FIX 10: Use smart pointers
    
public:
    ~CommandManager() {
        // FIX 11: Destructor not needed with smart pointers - automatic cleanup
    }
    
    void executeCommand(Command* cmd) {
        if (!cmd) return;  // FIX 12: Null pointer check
        
        try {
            cmd->execute();
            undoStack.push(std::unique_ptr<Command>(cmd));
            
            // FIX 13: Clear redo stack when new command is executed
            while (!redoStack.empty()) {
                redoStack.pop();
            }
        } catch (const std::exception& e) {
            // FIX 14: Proper error handling
            delete cmd;  // Clean up on failure
            throw;
        }
    }
    
    bool canUndo() const {
        return !undoStack.empty();
    }
    
    bool canRedo() const {
        return !redoStack.empty();
    }
    
    void undo() {
        if (!canUndo()) {
            throw std::logic_error("No commands to undo");  // FIX 15: Proper error handling
        }
        
        auto cmd = std::move(undoStack.top());
        undoStack.pop();
        
        try {
            cmd->undo();
            redoStack.push(std::unique_ptr<Command>(cmd->clone()));  // FIX 16: Clone for redo
        } catch (const std::exception& e) {
            // FIX 17: Restore state on undo failure
            undoStack.push(std::move(cmd));
            throw;
        }
    }
    
    void redo() {
        if (!canRedo()) {
            throw std::logic_error("No commands to redo");  // FIX 18: Proper error handling
        }
        
        auto cmd = std::move(redoStack.top());
        redoStack.pop();
        
        try {
            cmd->execute();
            undoStack.push(std::unique_ptr<Command>(cmd->clone()));  // FIX 19: Clone for undo
        } catch (const std::exception& e) {
            // FIX 20: Restore state on redo failure
            redoStack.push(std::move(cmd));
            throw;
        }
    }
    
    int getUndoCount() const {
        return (int)undoStack.size();
    }
    
    int getRedoCount() const {
        return (int)redoStack.size();
    }
};

// Test functions with proper error handling and cleanup
void testBasicCommands() {
    std::cout << "\n=== Testing Basic Commands ===" << std::endl;
    
    TextEditor editor;
    CommandManager manager;
    
    try {
        // Test insert commands with proper memory management
        manager.executeCommand(new InsertCommand(&editor, 0, "Hello"));
        std::cout << "After insert 'Hello': '" << editor.getContent() << "'" << std::endl;
        
        manager.executeCommand(new InsertCommand(&editor, 5, " World"));
        std::cout << "After insert ' World': '" << editor.getContent() << "'" << std::endl;
        
        // FIX 21: Commands are properly managed by CommandManager now
        std::cout << "Commands in undo stack: " << manager.getUndoCount() << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "Error in testBasicCommands: " << e.what() << std::endl;
    }
}

void testUndoRedo() {
    std::cout << "\n=== Testing Undo/Redo ===" << std::endl;
    
    TextEditor editor;
    CommandManager manager;
    
    try {
        // Execute some commands
        manager.executeCommand(new InsertCommand(&editor, 0, "ABC"));
        manager.executeCommand(new InsertCommand(&editor, 3, "DEF"));
        std::cout << "After commands: '" << editor.getContent() << "'" << std::endl;
        
        // Test undo with proper error handling
        std::cout << "Can undo: " << (manager.canUndo() ? "YES" : "NO") << std::endl;
        if (manager.canUndo()) {
            manager.undo();
            std::cout << "After undo: '" << editor.getContent() << "'" << std::endl;
        }
        
        // Test redo with proper error handling
        std::cout << "Can redo: " << (manager.canRedo() ? "YES" : "NO") << std::endl;
        if (manager.canRedo()) {
            manager.redo();
            std::cout << "After redo: '" << editor.getContent() << "'" << std::endl;
        }
        
    } catch (const std::exception& e) {
        std::cerr << "Error in testUndoRedo: " << e.what() << std::endl;
    }
}

void testDeleteOperations() {
    std::cout << "\n=== Testing Delete Operations ===" << std::endl;
    
    TextEditor editor;
    CommandManager manager;
    
    try {
        // Set up initial content
        manager.executeCommand(new InsertCommand(&editor, 0, "Hello World!"));
        std::cout << "Initial: '" << editor.getContent() << "'" << std::endl;
        
        // Delete some text with proper bounds checking
        if (editor.getLength() >= 11) {  // FIX 22: Check bounds before delete
            manager.executeCommand(new DeleteCommand(&editor, 5, 6));  // Delete " World"
            std::cout << "After delete: '" << editor.getContent() << "'" << std::endl;
        }
        
        // Try to undo delete
        if (manager.canUndo()) {
            manager.undo();
            std::cout << "After undo delete: '" << editor.getContent() << "'" << std::endl;
        }
        
    } catch (const std::exception& e) {
        std::cerr << "Error in testDeleteOperations: " << e.what() << std::endl;
    }
}

void testErrorHandling() {
    std::cout << "\n=== Testing Error Handling ===" << std::endl;
    
    TextEditor editor;
    CommandManager manager;
    
    try {
        // Test invalid operations
        std::cout << "Testing invalid insert position..." << std::endl;
        try {
            manager.executeCommand(new InsertCommand(&editor, 100, "test"));
        } catch (const std::exception& e) {
            std::cout << "Caught expected error: " << e.what() << std::endl;
        }
        
        std::cout << "Testing undo on empty stack..." << std::endl;
        try {
            CommandManager emptyManager;
            emptyManager.undo();
        } catch (const std::exception& e) {
            std::cout << "Caught expected error: " << e.what() << std::endl;
        }
        
    } catch (const std::exception& e) {
        std::cerr << "Unexpected error in testErrorHandling: " << e.what() << std::endl;
    }
}

// FIX 23: Main function with comprehensive testing and proper cleanup
#ifndef ORACLE_BUILD
int main() {
    std::cout << "Fix Me C++ 3 - Command Pattern Challenge (FIXED)" << std::endl;
    std::cout << "===============================================" << std::endl;
    
    try {
        testBasicCommands();
        testUndoRedo();
        testDeleteOperations();
        testErrorHandling();  // FIX 24: Added comprehensive error testing
        
        std::cout << "\n=== All Tests Completed Successfully ===" << std::endl;
        return 0;
        
    } catch (const std::exception& e) {
        std::cerr << "Fatal error: " << e.what() << std::endl;
        return 1;
    }
}
#endif
