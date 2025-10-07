// CORRECTED VERSION - This is what participants need to achieve

// Function to calculate the sum of numbers from 1 to n
// FIXED: Changed i < n to i <= n
int calculateSum(int n) {
    int sum = 0;
    for (int i = 1; i <= n; i++) {  // FIXED: was i < n
        sum += i;
    }
    return sum;
}

// Function to check if a number is prime  
// FIXED: Changed loop condition for efficiency and correctness
bool isPrime(int num) {
    if (num <= 1) return false;
    if (num == 2) return true;
    if (num % 2 == 0) return false;
    
    for (int i = 3; i * i <= num; i += 2) {  // FIXED: was i < num
        if (num % i == 0) {
            return false;
        }
    }
    return true;
}