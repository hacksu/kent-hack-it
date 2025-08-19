#ifndef TUNN_NETWORK
#define TUNN_NETWORK

#include <iostream>
#include <string>
#include <cstring>
#include <vector>

#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h> 
#include <sys/types.h>
#include <sys/socket.h>
#include <sys/select.h>

#include <thread>

#include <node.hpp>

class TunNet {
public:
    TunNet();
    ~TunNet();

    Node* Auth(const int& conn);

    bool DebugConnect(const int& conn);
    void DebugConsole(const int& conn);

    void ConnectionHandle(const int& sock_conn);

    void AddNode(Node* node);
    void RunNetwork(const std::string LHOST, const int LPORT);
    size_t GetNodeCount() const;
private:
    std::vector<Node*> nodes;
    std::vector<std::thread*> connections;
    bool shutdown;
};

#endif
