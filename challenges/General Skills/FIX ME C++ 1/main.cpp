// Fix Me C++ Challenge
// There are bugs in the functions below - can you find and fix them?
// Compile this file and link it with the oracle to test your fixes!
//
// Usage: 
// 1. Fix the bugs in the functions below
// 2. Compile: g++ -c -o functions.o main.cpp
// 3. Link with oracle: g++ -o test oracle.o functions.o
// 4. Run: ./test

// Function to calculate the sum of numbers from 1 to n
// There's a bug in this function - can you find and fix it?
int calculateSum(int n) {
    int sum = 0;
    for (int i = 1; i < n; i++) {
        sum += i;
    }
    return sum;
}

// Function to check if a number is prime
// There's also a subtle bug here!
bool isPrime(int num) {
    if (num <= 1) return false;
    if (num == 2) return true;
    if (num % 2 == 0) return false;
    
    for (int i = 3; i < num; i += 2) {
        if (num % i == 0) {
            return false;
        }
    }
    return true;
}
