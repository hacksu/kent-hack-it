#include <network.hpp>

TunNet::TunNet(): shutdown(false) {}
TunNet::~TunNet() {
    shutdown = true;

    // ensure all threads have ended before destructing them
    for (size_t i = 0; i < connections.size(); ++i) {
        connections[i]->join();
        delete connections[i];
    }

    // destruct nodes once connections are killed
    for (size_t i = 0; i < nodes.size(); ++i) {
        delete nodes[i];
    }
}

void TunNet::AddNode(Node* node) { nodes.push_back(node); }
size_t TunNet::GetNodeCount() const { return nodes.size(); }

// send data to a socket
void Send(const int& conn, const std::string data) {
    try {
        const char* data_cstr = data.c_str();
        send(conn, data_cstr, static_cast<int>(std::strlen(data_cstr)), 0); 
    } catch (const std::exception& e) {
        std::cerr << "[-] EXCEPTION: " << e.what() << std::endl;
    }
}

// recv data from a socket and turn the data into a string
std::string Recv(const int& conn) {
    try {
        char buffer[64];
        int recvBytes = recv(conn, buffer, sizeof(buffer), 0);

        // error occured
        if (recvBytes <= 0) return "error";

        // remove the trailing new-line if present
        if (buffer[recvBytes-1] == '\n') --recvBytes;

        return std::string(buffer, recvBytes);
    }  catch (const std::exception& e) {
        std::cerr << "[-] EXCEPTION: " << e.what() << std::endl;
        return "recv_exception_error";
    }
}

Node* TunNet::Auth(const int& conn) {
    // send auth content and request username
    std::string auth_header = "##### LOGIN #####\n"
                              "username > ";
    Send(conn, auth_header);

    // capture username
    std::string username = Recv(conn);
    // request password & capture password
    Send(conn, "password > ");
    std::string password = Recv(conn);

    // send auth closing header
    Send(conn, "#################\n");

    std::cerr << username << ":" << password << std::endl;

    // check if the credentials match an existing node
    for (Node* node : nodes) {
        if (node->Accept(username, password)) {
            return node;
        }
    }
    return nullptr;
}

bool TunNet::DebugConnect(const int& conn) {
    char buffer[64];
    size_t size = 64;
    int timeout_sec = 1;

    fd_set fds;
    FD_ZERO(&fds);
    FD_SET(conn, &fds);

    struct timeval tv;
    tv.tv_sec = timeout_sec;
    tv.tv_usec = 0;

    // using select allows this recv to not block forever (uses timeout logic)
    int ret = select(conn + 1, &fds, NULL, NULL, &tv);
    if (ret > 0 && FD_ISSET(conn, &fds)) {
        ssize_t n = recv(conn, buffer, size - 1, 0);
        if (n > 0) {
            // recv data now we check the data
            std::string data(buffer,n-1);
            return data == "PREPROD_ENV";
        } else if (n == 0) {
            // error occured
            return false;
        } else {
            // error occured
            return false;
        }
    } else if (ret == 0) {
        // No data recv
        return false;
    } else {
        // error occured
        return false;
    }
}
void TunNet::DebugConsole(const int& conn) {
    std::string banner = "##### DEBUG CONSOLE #####\n";
    Send(conn, banner);

    // take input from socket and send it to the Node interface
    std::string input = "";
    while (input != "exit") {
        // send input prompt
        std::string prompt = "DBG >$ ";
        Send(conn, prompt);

        // capture input
        input = Recv(conn);
        if (input.empty() || input == "exit") continue;

        // process the input
        std::string output = "";
        if (input == "help") {
            output = "help....show this page\n"
                     "dump....dump all nodes\n"
                     "exit....exit this session\n";
        } else if (input == "dump") {
            for (Node* node : nodes) {
                output += node->Dump();
                output += "\n";
            }
        } else {
            output = input;
            output += " :Command not Found\n";
        }
        
        // send-back response to inputs
        Send(conn, output);
    }

}

// Thread Target
void TunNet::ConnectionHandle(const int& sock_conn) {
    if (shutdown) return;

    // if something was immediently sent over upon connection
    // send the connection to separate login
    //######## (dont enable in production) ##########
    bool debugged = DebugConnect(sock_conn);
    if (debugged) {
        // interact with special debug interface
        DebugConsole(sock_conn);
    } else {
        Node* node = Auth(sock_conn);
        if (node != nullptr) {
            std::cout << "[*] User Authenticated!" << std::endl;

            // allow interaction with said node
            std::string node_banner = "";
            
            node_banner += "##### NODE ";
            node_banner += node->GetName();
            node_banner += " #####\n";

            Send(sock_conn, node_banner);

            // take input from socket and send it to the Node interface
            std::string input;
            while (input != "exit") {
                if (shutdown) return;

                // send input prompt
                std::string prompt = node->GetName();
                prompt += " >$ ";
                Send(sock_conn, prompt);

                input = Recv(sock_conn);

                if (shutdown) return;

                if (input == "exit") break;
                
                // process normal inputs
                std::string output = node->Interact(input);
                Send(sock_conn, output);
            }
        } else {
            Send(sock_conn, "Login Failed!");
        }
    }
    close(sock_conn);
}

void TunNet::RunNetwork(const std::string LHOST, const int LPORT) {
    // start up the socket server
    int sock_server = socket(AF_INET, SOCK_STREAM, 0);
    if (sock_server == -1)
    {
        std::cerr << "[-] Failed to create socket server!" << std::endl;
        return;
    }

    sockaddr_in server_address;
    server_address.sin_family = AF_INET;
    server_address.sin_port = htons(LPORT);
    
    if (inet_pton(AF_INET, LHOST.c_str(), &server_address.sin_addr) <= 0) {
        std::cerr << "[-] Address invalid!" << std::endl;
        close(sock_server);
        return;
    }

    if (bind(sock_server, (struct sockaddr *)&server_address, sizeof(server_address)) < 0)
    {
        std::cerr << "[-] Failed to Bind socket server!" << std::endl;
        close(sock_server);
        return;
    }

    // Listen for incoming connections
    if (listen(sock_server, 1) == -1)
    {
        std::cerr << "[-] Failed to listen on server-side!" << std::endl;
        close(sock_server);
        return;
    }

    // listen for connections to server
    std::cout << "Server Active on " << LHOST << ":" << LPORT << "\n";
    std::cout << "Waiting for connection...\n";

    sockaddr_in client_addr;
    socklen_t client_addr_len = sizeof(client_addr);
    while (!shutdown) {
        int sock_conn = accept(sock_server, (struct sockaddr *)&client_addr, &client_addr_len);

        if (sock_conn == -1) {
            std::cerr << "[-] Failed to accept incoming connection!" << std::endl;
            close(sock_conn);
        }

        std::cout << "[+] Connection Accepted!" << std::endl;
        // move the connect to a separate thread
        if (!shutdown) {
            connections.push_back(new std::thread(&TunNet::ConnectionHandle, this, sock_conn));
        }    
    }
}
