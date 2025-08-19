#ifndef TUN_NODE
#define TUN_NODE

#include <iostream>
#include <string>
#include <vector>
#include <sstream>

class Node {
public:
    Node();
    Node(std::string n, std::string u, std::string p, std::vector<std::string> notes_ = {});
    bool Accept(const std::string& u, const std::string& p);

    std::string GetName() const;
    std::string Dump();

    std::string Interact(const std::string input);
    std::string Process(const std::string& cmd);
private:
    std::string name;
    std::string username;
    std::string password;
    std::vector<std::string> notes;
    bool initialized;
};

#endif
