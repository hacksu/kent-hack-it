#include <iostream>
#include <string>
#include <stdio.h>

const unsigned char L[] = {0x16, 0x0d, 0x19, 0x0e, 0x17, 0x16, 0x3d, 0x12, 0x2c, 0x3c, 0x12, 0x13, 0x39, 0x2e, 0x05};
const int k = 0;
const int r = 4;

bool validate(const std::string& s) {
    for (int i = 0; i < s.length(); ++i) {
        int l = s[i];

        int n = l << (i + r);
        n /= k+1;

        int m = n % 'A';
        unsigned char p = static_cast<unsigned char>(m);

        if (L[i] != p) {
            return false;
        }
    }
    return true;
}

int main() {
    std::string input;
    std::printf("Enter your key: ");
    std::cin >> input;

    if (validate(input)) {
        std::cout << "CORRECT!" << std::endl;
    } else {
        std::cout << "INVALID!" << std::endl;
    }
}
