// CORRECTED VERSION - Fix Me C++ Challenge 2

#include <string>
#include <vector>
#include <iostream>

using namespace std;

// Function to reverse a string
// FIXED: Proper indexing in the reversal algorithm
string reverseString(const string& input) {
    string result = input;
    int n = result.size();
    
    for (int i = 0; i < n / 2; i++) {
        char temp = result[i];
        result[i] = result[n - 1 - i];
        result[n - 1 - i] = temp;  // FIXED: n - 1 - i, not n - i
    }
    
    return result;
}

// Function to find maximum sum subarray (Kadane's algorithm)  
// FIXED: Proper initialization and logic
int maxSubarraySum(const vector<int>& arr) {
    if (arr.empty()) return 0;
    
    int maxSoFar = arr[0];  // FIXED: Initialize to arr[0] for negative arrays
    int maxEndingHere = arr[0];  // FIXED: Initialize properly
    
    for (size_t i = 1; i < arr.size(); i++) {  // FIXED: Start from 1
        maxEndingHere = (arr[i] > maxEndingHere + arr[i]) ? arr[i] : maxEndingHere + arr[i];
        maxSoFar = (maxSoFar < maxEndingHere) ? maxEndingHere : maxSoFar;  // FIXED: Correct comparison
    }
    
    return maxSoFar;
}

// Function to perform binary search
// FIXED: Proper boundary handling and overflow prevention
int binarySearch(const vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;  // FIXED: arr.size() - 1
    
    while (left <= right) {
        int mid = left + (right - left) / 2;  // FIXED: Prevent overflow
        
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;  // FIXED: mid + 1
        } else {
            right = mid - 1;  // FIXED: mid - 1  
        }
    }
    
    return -1;
}

// Function to calculate factorial
// FIXED: Proper base cases and negative number handling
long long factorial(int n) {
    if (n < 0) return -1;  // FIXED: Handle negative input
    if (n == 0 || n == 1) return 1;  // FIXED: Handle n == 0 case
    return n * factorial(n - 1);
}

// Function to merge two sorted vectors
// FIXED: Proper boundary conditions
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
    while (i < arr1.size()) {  // FIXED: i < arr1.size()
        result.push_back(arr1[i]);
        i++;
    }
    
    while (j < arr2.size()) {  // FIXED: j < arr2.size()
        result.push_back(arr2[j]);
        j++;
    }
    
    return result;
}