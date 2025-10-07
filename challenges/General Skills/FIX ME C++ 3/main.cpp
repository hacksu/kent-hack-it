/*
 * Fix Me C++ 3 - Hard Level Challenge
 * 
 * Theme: Design Patterns & Memory Management
 * Pattern: Command Pattern
 * 
 * This code implements a text editor system using the command pattern.
 * However, there are several bugs that need to be fixed:
 * 
 * Your task: Find and fix all the bugs to make the program work correctly!
 * 
 * Expected behavior:
 * - Commands should follow proper interface design
 * - Memory should be managed correctly (no leaks)
 * - Undo/Redo functionality should work properly
 * - Commands should be executed and stored correctly
 */

#include <iostream>
#include <string>
#include <vector>
#include <memory>

// Bug 1: Missing virtual destructor in base class
class Command {
public:
    // Bug 2: Missing virtual keyword for proper polymorphism
    void execute() = 0;
    void undo() = 0;
    
    // Bug 3: Should have virtual destructor for proper cleanup
};

// Text editor that will receive commands
class TextEditor {
private:
    std::string content;
    
public:
    TextEditor() : content("") {}
    
    void insertText(const std::string& text, int position) {
        if (position < 0 || position > static_cast<int>(content.length())) {
            return; // Invalid position
        }
        content.insert(position, text);
    }
    
    void deleteText(int position, int length) {
        if (position < 0 || position >= static_cast<int>(content.length()) || length <= 0) {
            return; // Invalid operation
        }
        content.erase(position, length);
    }
    
    std::string getContent() const {
        return content;
    }
    
    void setContent(const std::string& newContent) {
        content = newContent;
    }
    
    int getLength() const {
        return static_cast<int>(content.length());
    }
};

// Bug 4: InsertCommand has memory management issues
class InsertCommand : public Command {
private:
    TextEditor* editor;
    std::string text;
    int position;
    
public:
    // Bug 5: Taking raw pointer instead of proper reference/shared_ptr
    InsertCommand(TextEditor* ed, const std::string& txt, int pos) 
        : editor(ed), text(txt), position(pos) {}
    
    // Bug 6: Missing override keyword for safety
    void execute() {
        if (editor) {
            editor->insertText(text, position);
        }
    }
    
    // Bug 7: Undo operation is incorrectly implemented
    void undo() {
        if (editor) {
            // Bug 8: This is wrong - should delete the inserted text
            editor->deleteText(0, text.length());
        }
    }
};

// Bug 9: DeleteCommand has similar issues
class DeleteCommand : public Command {
private:
    TextEditor* editor;
    int position;
    int length;
    // Bug 10: Missing storage of deleted text for proper undo
    
public:
    DeleteCommand(TextEditor* ed, int pos, int len) 
        : editor(ed), position(pos), length(len) {}
    
    void execute() {
        if (editor) {
            editor->deleteText(position, length);
        }
    }
    
    // Bug 11: Cannot undo delete without storing original text
    void undo() {
        if (editor) {
            // Bug 12: This won't work - we don't know what was deleted
            editor->insertText("", position);
        }
    }
};

// Bug 13: CommandManager has multiple memory management issues
class CommandManager {
private:
    std::vector<Command*> history;  // Bug 14: Raw pointers instead of smart pointers
    int currentIndex;
    
public:
    CommandManager() : currentIndex(-1) {}
    
    // Bug 15: No destructor to clean up commands
    
    void executeCommand(Command* cmd) {  // Bug 16: Raw pointer parameter
        if (!cmd) return;
        
        cmd->execute();
        
        // Bug 17: Memory leak - adding raw pointer without ownership management
        history.push_back(cmd);
        currentIndex++;
        
        // Bug 18: Not handling redo stack properly - should clear future commands
    }
    
    void undo() {
        // Bug 19: No bounds checking
        if (currentIndex >= 0) {
            history[currentIndex]->undo();
            currentIndex--;
        }
    }
    
    void redo() {
        // Bug 20: Incorrect redo logic
        if (currentIndex < static_cast<int>(history.size()) - 1) {
            currentIndex++;
            history[currentIndex]->execute();
        }
    }
    
    bool canUndo() const {
        return currentIndex >= 0;
    }
    
    bool canRedo() const {
        return currentIndex < static_cast<int>(history.size()) - 1;
    }
    
    // Bug 21: Missing method to get command history size
    void clearHistory() {
        // Bug 22: Memory leak - not deleting commands before clearing
        history.clear();
        currentIndex = -1;
    }
};

// Test functions that will be called by the oracle
void testBasicCommands() {
    std::cout << "\n=== Testing Basic Commands ===" << std::endl;
    
    TextEditor editor;
    CommandManager manager;
    
    // Test insert commands
    Command* insertCmd1 = new InsertCommand(&editor, 0, "Hello");
    Command* insertCmd2 = new InsertCommand(&editor, 5, " World");
    
    manager.executeCommand(insertCmd1);
    std::cout << "After insert 'Hello': '" << editor.getContent() << "'" << std::endl;
    
    manager.executeCommand(insertCmd2);
    std::cout << "After insert ' World': '" << editor.getContent() << "'" << std::endl;
    
    // Bug 23: Potential memory leak - not cleaning up commands
}

void testUndoRedo() {
    std::cout << "\n=== Testing Undo/Redo ===" << std::endl;
    
    TextEditor editor;
    CommandManager manager;
    
    // Execute some commands
    manager.executeCommand(new InsertCommand(&editor, 0, "ABC"));
    manager.executeCommand(new InsertCommand(&editor, 3, "DEF"));
    std::cout << "After commands: '" << editor.getContent() << "'" << std::endl;
    
    // Test undo
    std::cout << "Can undo: " << (manager.canUndo() ? "YES" : "NO") << std::endl;
    if (manager.canUndo()) {
        manager.undo();
        std::cout << "After undo: '" << editor.getContent() << "'" << std::endl;
    }
    
    // Test redo
    std::cout << "Can redo: " << (manager.canRedo() ? "YES" : "NO") << std::endl;
    if (manager.canRedo()) {
        manager.redo();
        std::cout << "After redo: '" << editor.getContent() << "'" << std::endl;
    }
}

void testDeleteOperations() {
    std::cout << "\n=== Testing Delete Operations ===" << std::endl;
    
    TextEditor editor;
    CommandManager manager;
    
    // Set up initial content
    manager.executeCommand(new InsertCommand(&editor, 0, "Hello World!"));
    std::cout << "Initial: '" << editor.getContent() << "'" << std::endl;
    
    // Delete some text
    manager.executeCommand(new DeleteCommand(&editor, 5, 6));  // Delete " World"
    std::cout << "After delete: '" << editor.getContent() << "'" << std::endl;
    
    // Try to undo delete
    if (manager.canUndo()) {
        manager.undo();
        std::cout << "After undo delete: '" << editor.getContent() << "'" << std::endl;
    }
}

// Bug 24: Main function doesn't properly clean up memory (would show memory leaks)
#ifndef ORACLE_BUILD
int main() {
    std::cout << "Fix Me C++ 3 - Command Pattern Challenge" << std::endl;
    std::cout << "=========================================" << std::endl;
    
    testBasicCommands();
    testUndoRedo();
    testDeleteOperations();
    
    std::cout << "\n=== Challenge Complete ===" << std::endl;
    
    return 0;
}
#endif