#include <iostream>
#include <vector>
#include <string>
using namespace std;

// These functions will be provided by participants in their compiled object file
extern int calculateSum(int n);
extern bool isPrime(int num);

int main() {
    cout << "=== CTF Challenge Oracle ===" << endl;
    cout << "Testing your fixed functions..." << endl;
    cout << endl;
    
    bool allTestsPassed = true;
    
    // Test 1: calculateSum function
    cout << "Test 1: Sum calculation" << endl;
    
    // Test cases for sum calculation
    int sumInputs[] = {1, 5, 10, 100};
    int sumExpected[] = {1, 15, 55, 5050};
    int numSumTests = 4;
    
    for (int i = 0; i < numSumTests; i++) {
        int result = calculateSum(sumInputs[i]);
        cout << "  calculateSum(" << sumInputs[i] << ") = " << result;
        if (result == sumExpected[i]) {
            cout << " ✓ PASS" << endl;
        } else {
            cout << " ✗ FAIL (expected " << sumExpected[i] << ")" << endl;
            allTestsPassed = false;
        }
    }
    
    cout << endl;
    
    // Test 2: isPrime function
    cout << "Test 2: Prime number check" << endl;
    
    // Test cases for prime checking
    int primeInputs[] = {2, 3, 4, 17, 25, 29, 97, 100};
    bool primeExpected[] = {true, true, false, true, false, true, true, false};
    int numPrimeTests = 8;
    
    for (int i = 0; i < numPrimeTests; i++) {
        bool result = isPrime(primeInputs[i]);
        cout << "  isPrime(" << primeInputs[i] << ") = " << (result ? "true" : "false");
        if (result == primeExpected[i]) {
            cout << " ✓ PASS" << endl;
        } else {
            cout << " ✗ FAIL (expected " << (primeExpected[i] ? "true" : "false") << ")" << endl;
            allTestsPassed = false;
        }
    }
    
    cout << endl;
    
    // Output result
    if (allTestsPassed) {
        cout << "🎉 ALL TESTS PASSED! 🎉" << endl;
        cout << "FLAG: khi{c++_debugging_is_ez_" << (calculateSum(7) + (isPrime(13) ? 100 : 0)) << "}" << endl;
    } else {
        cout << "❌ Some tests failed. Fix the bugs and try again!" << endl;
        cout << "Hint: Check your loop conditions and mathematical logic." << endl;
    }
    
    return 0;
}