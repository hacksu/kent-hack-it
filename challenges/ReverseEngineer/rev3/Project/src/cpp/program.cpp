#include <iostream>
#include <string>
#include <stdio.h>

unsigned char L[] = {0x16, 0x0d, 0x19, 0x0e, 0x3c, 0x06, 0x28, 0x16, 0x34, 0x19, 0x1d, 0x2d, 0x35, 0x09, 0x0f, 0x05, 0x13, 0x07, 0x28, 0x34, 0x33, 0x27, 0x0a, 0x2d, 0x27, 0x27, 0x10, 0x14, 0x3c, 0x28};
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
