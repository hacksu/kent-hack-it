#include <client.hpp>

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
        char buffer[2048];
        int recvBytes = recv(conn, buffer, sizeof(buffer), 0);
        return std::string(buffer, recvBytes);
    }  catch (const std::exception& e) {
        std::cerr << "[-] EXCEPTION: " << e.what() << std::endl;
        return "recv_exception_error";
    }
}

// REMOVE IN PRODUCTION
void AutoLogin(const int& server) {
    const char* phrase = "PREPROD_ENV";
    Send(server, phrase);
}

TunClient::TunClient(const std::string HOST, const int PORT): connected(false) {
    server = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (server == -1) {
        std::cerr << "[-] Socket creation failed.\n";
        close(server);
        return;
    }

    sockaddr_in serv_addr;
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(PORT);
    inet_pton(AF_INET, HOST.c_str(), &serv_addr.sin_addr);

    std::cout << "[*] Attempting to Connect to | " << HOST << ":" << PORT << std::endl;

    if (connect(server, (sockaddr*)&serv_addr, sizeof(serv_addr)) == -1) {
        std::cerr << "[-] Connection failed.\n";
        close(server);
        return;
    }

    std::cout << "[+] Connected to TunNet!" << std::endl;
    connected = true;
}

// handle login prompt
bool TunClient::Auth() {
    // print header
    std::cout << Recv(server);

    // send username
    std::string username;
    std::getline(std::cin, username);
    Send(server, username);

    // send password
    std::cout << Recv(server);
    std::string password;
    std::getline(std::cin, password);
    Send(server, password);

    // get response
    std::cout << Recv(server);
    std::string output = Recv(server);

    return output != "Login Failed!";
}

// interact with authenticated session
void TunClient::Interact() {
    std::string input = "";

    while (input != "exit") {
        std::getline(std::cin, input);

        // send everything
        Send(server, input);

        // recv responses based on valid input
        if (input != "exit") {
            std::string output;
            output = Recv(server);
            std::cout << output;
        }
    }

    close(server);
}

bool TunClient::IsConnected() const { return connected; }

TunClient::~TunClient() {
    close(server);
    connected = false;
}

int main(int argc, char** argv) {
    if (argc == 3) {
        TunClient client = TunClient(argv[1], std::stoi(std::string(argv[2])));
        if (client.IsConnected()) {
            if (client.Auth()) {
                std::cout << "[*] Authenticated!" << std::endl;
                client.Interact();
            } else {
                std::cout << "[-] Authentication Failed" << std::endl;
            }
        }
    } else {
        std::cout << "[*] Usage: " << argv[0] << " [IP] [PORT]" << std::endl;
    }
}
