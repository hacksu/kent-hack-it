#include <node.hpp>

Node::Node(): initialized(false) {}
Node::Node(std::string n, std::string u, std::string p) {
    name = n;
    username = u;
    password = p;
    notes = {};
    initialized = true;
}

std::string Node::GetName() const { return name; }

std::string Node::Dump() {
    std::string s;
    s = "NODE | [ "
        "username: ";

    s += username;
    s += " password: ";
    s += password;

    s += " node_name: ";
    s += name;
    s += " ]";

    return s;
}

bool Node::Accept(const std::string& u, const std::string& p) {
    return u == username && p == password;
}

std::string Node::Process(const std::string& cmd) {
    std::ostringstream stream;

    if (cmd == "notes") {
        for (const std::string& note : notes) {
            stream << "=== NOTE_BEGIN ===\n";
            stream << note << std::endl;
            stream << "=== NOTE_END ===\n\n";
        }
    } else if (cmd == "help") {
        stream << "help...show this page" << std::endl;
        stream << "notes..show saved notes" << std::endl;
        stream << "exit...exit session" << std::endl;
    } else if (cmd == "exit") {
        return "";
    } else {
        stream << cmd << " :Command not Found" << std::endl;
    }

    return stream.str();
}

// acts like an interface
std::string Node::Interact(const std::string input) {
    if (!input.empty() && input != "exit") {
        return Process(input);
    }
    return "";
}
