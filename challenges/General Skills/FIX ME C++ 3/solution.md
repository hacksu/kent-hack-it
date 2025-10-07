# Fix Me C++ 3 - Solution Guide# Fix Me C++ 3 - Solution Guide

## Command Pattern Challenge## Command Pattern Challenge



### Challenge Overview### Challenge Overview

This challenge implements a text editor using the Command design pattern with intentional bugs in memory management, polymorphism, and pattern implementation.This challenge implements a text editor using the Command design pattern with intentional bugs in memory management, polymorphism, and pattern implementation.



### Bug Categories and Solutions### Bug Categories and Solutions



#### 1. Memory Management Bugs (Critical)#### 1. Memory Management Bugs (Critical)



**Bug 1: Missing Virtual Destructor**```cpp

```cpp

// BROKEN:**Bug 1: Missing Virtual Destructor**// BEFORE (buggy)

class Command {

public:```cpppublic:

    virtual void execute() = 0;

    virtual void undo() = 0;// BROKEN:    ConfigManager() { ... }

};

class Command {

// FIXED:

class Command {public:// AFTER (fixed) 

public:

    virtual ~Command() = default;  // Essential for polymorphism    virtual void execute() = 0;private:

    virtual void execute() = 0;

    virtual void undo() = 0;    virtual void undo() = 0;    ConfigManager() { ... }

};

```};```



**Bug 2: Raw Pointer Memory Leaks**

```cpp

// BROKEN:// FIXED:### Bug 2: Improper getInstance Implementation

Command* cmd = new InsertCommand(&editor, 0, "text");

manager.executeCommand(cmd);class Command {**Location:** Line 33  

// Memory leak - cmd never deleted

public:**Issue:** Uses `new` without proper cleanup, not thread-safe  

// FIXED:

std::unique_ptr<Command> cmd(new InsertCommand(&editor, 0, "text"));    virtual ~Command() = default;  // Essential for polymorphism**Fix:** Use Meyer's Singleton with static local variable

manager.executeCommand(cmd.release());  // Transfer ownership

```    virtual void execute() = 0;



**Bug 3: Missing Clone Method**    virtual void undo() = 0;```cpp

```cpp

// Commands need proper copying for undo/redo stacks};// BEFORE (buggy)

virtual Command* clone() const = 0;

``````static ConfigManager* getInstance() {



#### 2. Command Pattern Implementation Bugs    static ConfigManager* instance = new ConfigManager();



**Bug 4-8: Improper Undo Logic****Bug 2: Raw Pointer Memory Leaks**    return instance;

```cpp

// BROKEN InsertCommand::undo():```cpp}

void undo() override {

    // Wrong: doesn't actually undo the insertion// BROKEN:

}

Command* cmd = new InsertCommand(&editor, 0, "text");// AFTER (fixed)

// FIXED InsertCommand::undo():

void undo() override {manager.executeCommand(cmd);static ConfigManager& getInstance() {

    editor->deleteText(position, text.size());  // Remove what was inserted

}// Memory leak - cmd never deleted    static ConfigManager instance;

```

    return instance;

**Bug 9-12: Missing Deleted Text Storage**

```cpp// FIXED:}

// BROKEN DeleteCommand:

class DeleteCommand {std::unique_ptr<Command> cmd(new InsertCommand(&editor, 0, "text"));```

    // Missing: std::string deletedText;

    manager.executeCommand(cmd.release());  // Transfer ownership

// FIXED DeleteCommand:

class DeleteCommand {```### Bug 3: Missing Destructor

private:

    std::string deletedText;  // Store for undo**Location:** Missing  

public:

    void execute() override {**Bug 3: Missing Clone Method****Issue:** No explicit destructor defined  

        deletedText = editor->deleteText(position, length);  // Save deleted text

    }```cpp**Fix:** Add proper destructor

    void undo() override {

        editor->insertText(position, deletedText);  // Restore deleted text// Commands need proper copying for undo/redo stacks

    }

};virtual Command* clone() const = 0;```cpp

```

```// AFTER (fixed)

#### 3. CommandManager Bugs

~ConfigManager() = default;

**Bug 13-15: Improper Stack Management**

```cpp#### 2. Command Pattern Implementation Bugs```

// BROKEN:

std::stack<Command*> undoStack;  // Raw pointers = memory leaks

std::stack<Command*> redoStack;

**Bug 4-8: Improper Undo Logic**### Bug 4: Copy Operations Not Deleted

// FIXED:

std::stack<std::unique_ptr<Command>> undoStack;  // Smart pointers```cpp**Location:** Lines 67-75  

std::stack<std::unique_ptr<Command>> redoStack;

```// BROKEN InsertCommand::undo():**Issue:** Copy constructor and assignment allow singleton violations  



**Bug 16-17: Missing Redo Stack Clearing**void undo() override {**Fix:** Delete copy operations

```cpp

// BROKEN executeCommand():    // Wrong: doesn't actually undo the insertion

void executeCommand(Command* cmd) {

    cmd->execute();}```cpp

    undoStack.push(cmd);

    // Missing: clear redo stack when new command executes// BEFORE (buggy) - allows copying

}

// FIXED InsertCommand::undo():ConfigManager(const ConfigManager& other) {

// FIXED executeCommand():

void executeCommand(Command* cmd) {void undo() override {    configs = other.configs;

    cmd->execute();

    undoStack.push(std::unique_ptr<Command>(cmd));    editor->deleteText(position, text.size());  // Remove what was inserted}

    // Clear redo stack - new commands invalidate redo history

    while (!redoStack.empty()) {}

        redoStack.pop();

    }```// AFTER (fixed) - prevents copying

}

```ConfigManager(const ConfigManager& other) = delete;



#### 4. TextEditor Bounds Checking Bugs**Bug 9-12: Missing Deleted Text Storage**ConfigManager& operator=(const ConfigManager& other) = delete;



**Bug 18-20: Missing Bounds Validation**```cpp```

```cpp

// BROKEN insertText():// BROKEN DeleteCommand:

void insertText(int position, const std::string& text) {

    content.insert(position, text);  // No bounds checking!class DeleteCommand {### Bug 5: Unsafe Container Access

}

    // Missing: std::string deletedText;**Location:** Line 44  

// FIXED insertText():

void insertText(int position, const std::string& text) {    **Issue:** `operator[]` creates entries for non-existent keys  

    if (position < 0 || position > (int)content.size()) {

        throw std::out_of_range("Insert position out of range");// FIXED DeleteCommand:**Fix:** Use `find()` with bounds checking

    }

    content.insert(position, text);class DeleteCommand {

}

```private:```cpp



**Bug 21-22: Delete Beyond Bounds**    std::string deletedText;  // Store for undo// BEFORE (buggy)

```cpp

// BROKEN deleteText():public:std::string getConfig(const std::string& key) {

std::string deleteText(int position, int length) {

    return content.substr(position, length);  // Can go beyond string end    void execute() override {    return configs[key];  // Creates empty entry if key doesn't exist!

}

        deletedText = editor->deleteText(position, length);  // Save deleted text}

// FIXED deleteText():

std::string deleteText(int position, int length) {    }

    if (position < 0 || position >= (int)content.size()) {

        throw std::out_of_range("Delete position out of range");    void undo() override {// AFTER (fixed)

    }

    if (position + length > (int)content.size()) {        editor->insertText(position, deletedText);  // Restore deleted textstd::string getConfig(const std::string& key) const {

        length = (int)content.size() - position;  // Clamp to valid range

    }    }    auto it = configs.find(key);

    std::string deletedText = content.substr(position, length);

    content.erase(position, length);};    if (it != configs.end()) {

    return deletedText;

}```        return it->second;

```

    }

#### 5. Error Handling Bugs

#### 3. CommandManager Bugs    return "";

**Bug 23: Missing Null Checks**

```cpp}

// BROKEN:

void executeCommand(Command* cmd) {**Bug 13-15: Improper Stack Management**```

    cmd->execute();  // What if cmd is null?

}```cpp



// FIXED:// BROKEN:### Bug 6: Missing Const Qualifiers

void executeCommand(Command* cmd) {

    if (!cmd) return;  // Null pointer checkstd::stack<Command*> undoStack;  // Raw pointers = memory leaks**Location:** Lines 49, 53  

    try {

        cmd->execute();std::stack<Command*> redoStack;**Issue:** Methods that don't modify state aren't marked const  

        // ... rest of implementation

    } catch (const std::exception& e) {**Fix:** Add const qualifiers

        delete cmd;  // Clean up on failure

        throw;// FIXED:

    }

}std::stack<std::unique_ptr<Command>> undoStack;  // Smart pointers```cpp

```

std::stack<std::unique_ptr<Command>> redoStack;// BEFORE (buggy)

**Bug 24: Missing Undo/Redo Validation**

```cpp```bool hasConfig(std::string key) {

// BROKEN:

void undo() {    return configs.find(key) != configs.end();

    auto cmd = undoStack.top();  // What if stack is empty?

    undoStack.pop();**Bug 16-17: Missing Redo Stack Clearing**}

    cmd->undo();

}```cpp



// FIXED:// BROKEN executeCommand():// AFTER (fixed)

void undo() {

    if (!canUndo()) {void executeCommand(Command* cmd) {bool hasConfig(const std::string& key) const {

        throw std::logic_error("No commands to undo");

    }    cmd->execute();    return configs.find(key) != configs.end();

    // ... safe implementation

}    undoStack.push(cmd);}

```

    // Missing: clear redo stack when new command executes```

### Complete Fixed Implementation Highlights

}

1. **Smart Pointers**: All dynamic memory managed with `std::unique_ptr`

2. **Virtual Destructor**: Proper polymorphic cleanup### Bug 7: Poor Parameter Passing

3. **Exception Safety**: All operations have proper error handling

4. **Bounds Checking**: All string operations validated// FIXED executeCommand():**Location:** Line 49  

5. **Command State**: Proper preservation of deleted text for undo

6. **Stack Management**: Redo stack cleared on new commandsvoid executeCommand(Command* cmd) {**Issue:** Pass by value instead of const reference  

7. **Clone Support**: Commands can be properly copied

    cmd->execute();**Fix:** Use const reference for string parameters

### Testing Strategy

    undoStack.push(std::unique_ptr<Command>(cmd));

The oracle tests validate:

- Basic command execution    // Clear redo stack - new commands invalidate redo history```cpp

- Proper undo/redo behavior

- Memory management (no leaks)    while (!redoStack.empty()) {// BEFORE (buggy)

- Error handling on invalid operations

- Edge cases (empty strings, invalid positions)        redoStack.pop();bool hasConfig(std::string key)



### Key Learning Points    }



1. **Virtual Destructors**: Always required for polymorphic base classes}// AFTER (fixed)  

2. **RAII**: Use smart pointers to manage memory automatically

3. **Command Pattern**: Requires careful state management for undo/redo```bool hasConfig(const std::string& key) const

4. **Error Handling**: Every operation should validate inputs and handle failures

5. **Design Patterns**: Implementation details matter - pattern adherence prevents bugs```



### Flag#### 4. TextEditor Bounds Checking Bugs



### Bug 8: Missing Configuration Validation

---

**Bug 18-20: Missing Bounds Validation****Location:** DatabaseConnection::connect()  

**Pro Tip**: Real-world command pattern implementations often use smart pointers and comprehensive error handling from the start. This challenge shows why those practices matter!
```cpp**Issue:** No validation before using configuration values  

// BROKEN insertText():**Fix:** Check if configs exist and are valid

void insertText(int position, const std::string& text) {

    content.insert(position, text);  // No bounds checking!```cpp

}// BEFORE (buggy)

std::string dbHost = config->getConfig("db_host");

// FIXED insertText():std::string dbPort = config->getConfig("db_port");

void insertText(int position, const std::string& text) {

    if (position < 0 || position > (int)content.size()) {// AFTER (fixed)

        throw std::out_of_range("Insert position out of range");if (!config.hasConfig("db_host") || !config.hasConfig("db_port")) {

    }    std::cout << "Error: Database configuration not found!" << std::endl;

    content.insert(position, text);    return;

}}

```

std::string dbHost = config.getConfig("db_host");

**Bug 21-22: Delete Beyond Bounds**std::string dbPort = config.getConfig("db_port");

```cpp

// BROKEN deleteText():if (dbHost.empty() || dbPort.empty()) {

std::string deleteText(int position, int length) {    std::cout << "Error: Database host or port is empty!" << std::endl;

    return content.substr(position, length);  // Can go beyond string end    return;

}}

```

// FIXED deleteText():

std::string deleteText(int position, int length) {### Bug 9: Pointer vs Reference Usage

    if (position < 0 || position >= (int)content.size()) {**Issue:** Using pointers instead of references for singleton  

        throw std::out_of_range("Delete position out of range");**Fix:** Use references consistently

    }

    if (position + length > (int)content.size()) {```cpp

        length = (int)content.size() - position;  // Clamp to valid range// BEFORE (buggy)

    }ConfigManager* config = ConfigManager::getInstance();

    std::string deletedText = content.substr(position, length);

    content.erase(position, length);// AFTER (fixed)

    return deletedText;ConfigManager& config = ConfigManager::getInstance();

}```

```

### Bug 10: Integer Casting

#### 5. Error Handling Bugs**Location:** getConfigCount()  

**Issue:** size_t to int conversion warning  

**Bug 23: Missing Null Checks****Fix:** Explicit cast

```cpp

// BROKEN:```cpp

void executeCommand(Command* cmd) {// AFTER (fixed)

    cmd->execute();  // What if cmd is null?int getConfigCount() const {

}    return static_cast<int>(configs.size());

}

// FIXED:```

void executeCommand(Command* cmd) {

    if (!cmd) return;  // Null pointer check## Key Concepts Demonstrated

    try {

        cmd->execute();### Meyer's Singleton Pattern

        // ... rest of implementationThe fixed version uses the Meyer's Singleton approach, which is:

    } catch (const std::exception& e) {- **Thread-safe** in C++11 and later (guaranteed by standard)

        delete cmd;  // Clean up on failure- **Exception-safe** (no manual memory management)

        throw;- **Lazy initialization** (created on first use)

    }- **Automatic cleanup** (destructor called at program end)

}

```### Copy Prevention

Explicitly deleting copy operations prevents:

**Bug 24: Missing Undo/Redo Validation**- Accidental singleton violations

```cpp- Compiler-generated copy functions

// BROKEN:- Silent bugs from unintended copying

void undo() {

    auto cmd = undoStack.top();  // What if stack is empty?### Const-Correctness

    undoStack.pop();Adding const qualifiers:

    cmd->undo();- Documents function intent

}- Enables compiler optimizations  

- Prevents accidental modifications

// FIXED:- Improves thread safety

void undo() {

    if (!canUndo()) {### Safe Container Access

        throw std::logic_error("No commands to undo");Using `find()` instead of `operator[]`:

    }- Prevents unintended element creation

    // ... safe implementation- Allows checking existence before access

}- Returns iterators for efficient checking

```- Maintains container integrity



### Complete Fixed Implementation Highlights## Testing Strategy



1. **Smart Pointers**: All dynamic memory managed with `std::unique_ptr`The oracle tests validate:

2. **Virtual Destructor**: Proper polymorphic cleanup1. **Singleton behavior** - Same instance returned

3. **Exception Safety**: All operations have proper error handling2. **Configuration persistence** - Data survives across calls

4. **Bounds Checking**: All string operations validated3. **Edge cases** - Non-existent keys handled properly  

5. **Command State**: Proper preservation of deleted text for undo4. **Memory safety** - No leaks or crashes

6. **Stack Management**: Redo stack cleared on new commands5. **Copy prevention** - Singleton integrity maintained

7. **Clone Support**: Commands can be properly copied

## Common Mistakes to Avoid

### Testing Strategy

1. **Using `new` in singleton** - Causes memory leaks

The oracle tests validate:2. **Forgetting const qualifiers** - Reduces safety and efficiency

- Basic command execution3. **Using `operator[]` for lookup** - Creates unintended entries

- Proper undo/redo behavior4. **Public constructor** - Allows multiple instances

- Memory management (no leaks)5. **Not deleting copy operations** - Allows singleton violations

- Error handling on invalid operations

- Edge cases (empty strings, invalid positions)## Performance Considerations



### Key Learning Points- Static local variable initialization is thread-safe (C++11+)

- Reference return avoids pointer dereferencing overhead

1. **Virtual Destructors**: Always required for polymorphic base classes- Const methods enable compiler optimizations

2. **RAII**: Use smart pointers to manage memory automatically- `find()` is O(log n) for std::map, acceptable for config lookup

3. **Command Pattern**: Requires careful state management for undo/redo

4. **Error Handling**: Every operation should validate inputs and handle failuresThe fixed solution demonstrates modern C++ best practices for implementing the singleton pattern safely and efficiently.
5. **Design Patterns**: Implementation details matter - pattern adherence prevents bugs

### Flag
When all bugs are fixed: `FLAG{c0mm4nd_p477ern_m4573r_2025}`

---

**Pro Tip**: Real-world command pattern implementations often use smart pointers and comprehensive error handling from the start. This challenge shows why those practices matter!