#ifndef TUN_CLIENT
#define TUN_CLIENT

#include <iostream>
#include <string>
#include <cstring>

#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/socket.h>

class TunClient {
public:
    TunClient(const std::string HOST, const int PORT);
    ~TunClient();

    bool Auth();
    void Interact();
    bool IsConnected() const;
private:
    int server;
    bool connected;
};

#endif
