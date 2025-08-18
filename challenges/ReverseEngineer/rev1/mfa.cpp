#include <iostream>
#include <string>
#include <random>
#include <chrono>

using uint = unsigned int;

int GetSeed() {
    auto n = std::chrono::system_clock::now();
    auto e = std::chrono::duration_cast<std::chrono::minutes>(
        n.time_since_epoch()
    ).count();
    return static_cast<int>(e);
}

uint Generate(const std::string& p1, const std::string& p2) {
    char prev = 'A';
    uint gar = std::rand() % 1000 + 1;
    int i = 0;
    int k = i;

    for (const char c2 : p2) {
        for (const char c : p1) {
            uint n = (int)(c ^ prev << c2 >> p2.length());
            prev = c;
            gar += n + (int)(c2 >> (i | k));
            ++i;
        }
        ++k;
    }
    return gar;
}

int main(int argc, char** argv) {
    srand(GetSeed());
    if (argc != 3) {
        std::cout << "[*] Usage: " << argv[0] << " [username] [password]" << std::endl;
        return 1;
    }
    std::string username(argv[1]);
    std::string password(argv[2]);

    std::printf("MFA Code: %i", Generate(username,password));
}
