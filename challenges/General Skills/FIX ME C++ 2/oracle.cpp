#include <iostream>
#include <string>
#include <vector>
using namespace std;

// These functions will be provided by participants in their compiled object file
extern string reverseString(const string& input);
extern int maxSubarraySum(const vector<int>& arr);
extern int binarySearch(const vector<int>& arr, int target);
extern long long factorial(int n);
extern vector<int> mergeSortedVectors(const vector<int>& arr1, const vector<int>& arr2);

int main() {
    cout << "=== CTF Challenge Oracle - MEDIUM DIFFICULTY ===" << endl;
    cout << "Testing your fixed functions..." << endl;
    cout << endl;
    
    bool allTestsPassed = true;
    int testsPassed = 0;
    int totalTests = 0;
    
    // Test 1: String Reversal
    cout << "Test 1: String Reversal" << endl;
    
    totalTests++;
    string result1 = reverseString("hello");
    if (result1 == "olleh") {
        cout << "  reverseString(\"hello\") = \"" << result1 << "\" ✓ PASS" << endl;
        testsPassed++;
    } else {
        cout << "  reverseString(\"hello\") = \"" << result1 << "\" ✗ FAIL (expected \"olleh\")" << endl;
        allTestsPassed = false;
    }
    
    totalTests++;
    string result2 = reverseString("world");
    if (result2 == "dlrow") {
        cout << "  reverseString(\"world\") = \"" << result2 << "\" ✓ PASS" << endl;
        testsPassed++;
    } else {
        cout << "  reverseString(\"world\") = \"" << result2 << "\" ✗ FAIL (expected \"dlrow\")" << endl;
        allTestsPassed = false;
    }
    
    cout << endl;
    
    // Test 2: Maximum Subarray Sum
    cout << "Test 2: Maximum Subarray Sum" << endl;
    
    vector<int> arr1;
    arr1.push_back(-2); arr1.push_back(-3); arr1.push_back(4); arr1.push_back(-1); 
    arr1.push_back(-2); arr1.push_back(1); arr1.push_back(5); arr1.push_back(-3);
    
    vector<int> arr2;
    arr2.push_back(-1); arr2.push_back(-2); arr2.push_back(-3); arr2.push_back(-4);
    
    vector<int> arr3;
    arr3.push_back(1); arr3.push_back(2); arr3.push_back(3); arr3.push_back(4); arr3.push_back(5);
    
    totalTests++;
    int maxSum1 = maxSubarraySum(arr1);
    if (maxSum1 == 7) {
        cout << "  maxSubarraySum([mixed]) = " << maxSum1 << " ✓ PASS" << endl;
        testsPassed++;
    } else {
        cout << "  maxSubarraySum([mixed]) = " << maxSum1 << " ✗ FAIL (expected 7)" << endl;
        allTestsPassed = false;
    }
    
    totalTests++;
    int maxSum2 = maxSubarraySum(arr2);
    if (maxSum2 == -1) {
        cout << "  maxSubarraySum([all negative]) = " << maxSum2 << " ✓ PASS" << endl;
        testsPassed++;
    } else {
        cout << "  maxSubarraySum([all negative]) = " << maxSum2 << " ✗ FAIL (expected -1)" << endl;
        allTestsPassed = false;
    }
    
    totalTests++;
    int maxSum3 = maxSubarraySum(arr3);
    if (maxSum3 == 15) {
        cout << "  maxSubarraySum([all positive]) = " << maxSum3 << " ✓ PASS" << endl;
        testsPassed++;
    } else {
        cout << "  maxSubarraySum([all positive]) = " << maxSum3 << " ✗ FAIL (expected 15)" << endl;
        allTestsPassed = false;
    }
    
    cout << endl;
    
    // Test 3: Binary Search
    cout << "Test 3: Binary Search" << endl;
    
    vector<int> sortedArr;
    sortedArr.push_back(1); sortedArr.push_back(3); sortedArr.push_back(5); sortedArr.push_back(7);
    sortedArr.push_back(9); sortedArr.push_back(11); sortedArr.push_back(13); sortedArr.push_back(15);
    
    totalTests++;
    int index1 = binarySearch(sortedArr, 7);
    if (index1 == 3) {
        cout << "  binarySearch([1,3,5,7,9,11,13,15], 7) = " << index1 << " ✓ PASS" << endl;
        testsPassed++;
    } else {
        cout << "  binarySearch([1,3,5,7,9,11,13,15], 7) = " << index1 << " ✗ FAIL (expected 3)" << endl;
        allTestsPassed = false;
    }
    
    totalTests++;
    int index2 = binarySearch(sortedArr, 1);
    if (index2 == 0) {
        cout << "  binarySearch([...], 1) = " << index2 << " ✓ PASS" << endl;
        testsPassed++;
    } else {
        cout << "  binarySearch([...], 1) = " << index2 << " ✗ FAIL (expected 0)" << endl;
        allTestsPassed = false;
    }
    
    totalTests++;
    int index3 = binarySearch(sortedArr, 16);
    if (index3 == -1) {
        cout << "  binarySearch([...], 16) = " << index3 << " ✓ PASS" << endl;
        testsPassed++;
    } else {
        cout << "  binarySearch([...], 16) = " << index3 << " ✗ FAIL (expected -1)" << endl;
        allTestsPassed = false;
    }
    
    cout << endl;
    
    // Test 4: Factorial
    cout << "Test 4: Factorial" << endl;
    
    totalTests++;
    long long fact1 = factorial(5);
    if (fact1 == 120) {
        cout << "  factorial(5) = " << fact1 << " ✓ PASS" << endl;
        testsPassed++;
    } else {
        cout << "  factorial(5) = " << fact1 << " ✗ FAIL (expected 120)" << endl;
        allTestsPassed = false;
    }
    
    totalTests++;
    long long fact2 = factorial(0);
    if (fact2 == 1) {
        cout << "  factorial(0) = " << fact2 << " ✓ PASS" << endl;
        testsPassed++;
    } else {
        cout << "  factorial(0) = " << fact2 << " ✗ FAIL (expected 1)" << endl;
        allTestsPassed = false;
    }
    
    cout << endl;
    
    // Test 5: Merge Sorted Vectors
    cout << "Test 5: Merge Sorted Vectors" << endl;
    
    vector<int> mergeArr1;
    mergeArr1.push_back(1); mergeArr1.push_back(3); mergeArr1.push_back(5);
    
    vector<int> mergeArr2;
    mergeArr2.push_back(2); mergeArr2.push_back(4); mergeArr2.push_back(6);
    
    vector<int> expected;
    expected.push_back(1); expected.push_back(2); expected.push_back(3);
    expected.push_back(4); expected.push_back(5); expected.push_back(6);
    
    totalTests++;
    vector<int> merged = mergeSortedVectors(mergeArr1, mergeArr2);
    bool mergeCorrect = true;
    
    if (merged.size() == expected.size()) {
        for (size_t i = 0; i < expected.size(); i++) {
            if (merged[i] != expected[i]) {
                mergeCorrect = false;
                break;
            }
        }
    } else {
        mergeCorrect = false;
    }
    
    if (mergeCorrect) {
        cout << "  mergeSortedVectors([1,3,5], [2,4,6]) = [1,2,3,4,5,6] ✓ PASS" << endl;
        testsPassed++;
    } else {
        cout << "  mergeSortedVectors([1,3,5], [2,4,6]) = [";
        for (size_t i = 0; i < merged.size(); i++) {
            cout << merged[i];
            if (i < merged.size() - 1) cout << ",";
        }
        cout << "] ✗ FAIL (expected [1,2,3,4,5,6])" << endl;
        allTestsPassed = false;
    }
    
    cout << endl;
    
    // Output result
    cout << "Test Results: " << testsPassed << "/" << totalTests << " passed" << endl;
    if (allTestsPassed) {
        cout << "🎉 ALL TESTS PASSED! 🎉" << endl;
        cout << "FLAG: khi{medium_c++_debugging_master_" << (testsPassed * 42) << "}" << endl;
    } else {
        cout << "❌ Some tests failed. Fix the bugs and try again!" << endl;
        cout << "Hints:" << endl;
        cout << "- Check memory allocation sizes" << endl;
        cout << "- Watch out for off-by-one errors" << endl;
        cout << "- Handle edge cases (empty inputs, negative numbers)" << endl;
        cout << "- Be careful with array bounds" << endl;
    }
    
    return 0;
}