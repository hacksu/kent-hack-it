#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <network.hpp>

std::string ReadFlag() {
    std::ifstream file("/home/programmer2/flag.txt");
    if (!file) {
        std::cerr << "Could not open file\n";
        return "";
    }

    std::ostringstream buffer;
    buffer << file.rdbuf();
    std::string content = buffer.str();
    return content;
}

int main() {
    TunNet net;
    
    // add nodes
    net.AddNode(new Node("ALPHA", "Jack", "3hUdDo3JBy7db"));
    net.AddNode(new Node("ZORAX", "Ethan", "X9hLq7Pw2DkJ"));
    net.AddNode(new Node("LYRIA", "Maya", "t4GcPzQwLm8R", {
        ReadFlag()
    }));
    net.AddNode(new Node("KRYPT", "Noah", "V7dJs3Kq9BxT"));
    net.AddNode(new Node("VANTA", "Liam", "a2NzR8WmYq5F"));
    net.AddNode(new Node("OMNIX", "Ava", "Q1rTp6XvBz9M"));

    // run network
    net.RunNetwork("0.0.0.0", 2531);
}
