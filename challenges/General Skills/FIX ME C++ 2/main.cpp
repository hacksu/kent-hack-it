// Fix Me C++ Challenge 2 - MEDIUM DIFFICULTY
// ==========================================
// There are several bugs in the functions below - can you find and fix them ALL?
// This challenge tests STL usage, algorithms, and data structure handling.
//
// Usage: 
// 1. Fix ALL the bugs in the functions below
// 2. Compile: make (or manually compile and link)
// 3. Run: ./test

#include <string>
#include <vector>
#include <iostream>

using namespace std;

// Function to reverse a string
// BUG: Logic error in the reversal algorithm
string reverseString(const string& input) {
    string result = input;
    int n = result.size();
    
    for (int i = 0; i < n / 2; i++) {
        char temp = result[i];
        result[i] = result[n - 1 - i];
        result[n - i] = temp;
    }
    
    return result;
}

// Function to find maximum sum subarray (Kadane's algorithm)  
// BUG: Incorrect initialization and logic
int maxSubarraySum(const vector<int>& arr) {
    if (arr.empty()) return 0;
    
    int maxSoFar = 0;
    int maxEndingHere = 0;
    
    for (size_t i = 0; i < arr.size(); i++) {
        maxEndingHere = maxEndingHere + arr[i];
        
        if (maxSoFar > maxEndingHere) {
            maxSoFar = maxEndingHere;
        }
        
        if (maxEndingHere < 0) {
            maxEndingHere = 0;
        }
    }
    
    return maxSoFar;
}

// Function to perform binary search
// BUG: Boundary issues and infinite loop potential
int binarySearch(const vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size();
    
    while (left <= right) {
        int mid = (left + right) / 2;
        
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid;
        } else {
            right = mid;  
        }
    }
    
    return -1;
}

// Function to calculate factorial
// BUG: Missing base case and no negative number handling
long long factorial(int n) {
    if (n == 1) return 1;
    return n * factorial(n - 1);
}

// Function to merge two sorted vectors
// BUG: Off-by-one errors in boundary conditions
vector<int> mergeSortedVectors(const vector<int>& arr1, const vector<int>& arr2) {
    vector<int> result;
    size_t i = 0, j = 0;
    
    // Merge the two arrays
    while (i < arr1.size() && j < arr2.size()) {
        if (arr1[i] <= arr2[j]) {
            result.push_back(arr1[i]);
            i++;
        } else {
            result.push_back(arr2[j]);
            j++;
        }
    }
    
    // Add remaining elements
    while (i <= arr1.size()) {
        result.push_back(arr1[i]);
        i++;
    }
    
    while (j <= arr2.size()) {
        result.push_back(arr2[j]);
        j++;
    }
    
    return result;
}