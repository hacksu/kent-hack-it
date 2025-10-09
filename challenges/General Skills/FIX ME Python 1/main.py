# Fix Me Python Challenge
# There are bugs in the functions below - can you find and fix them?
# Run oracle.py to test your fixes!
#
# Usage: 
# 1. Fix the bugs in the functions below
# 2. Run: python oracle.py
# 3. If all tests pass, you'll get the flag!

def calculate_sum(n):
    """
    Calculate the sum of numbers from 1 to n
    There's a bug in this function - can you find and fix it?
    """
    total = 0
    for i in range(1, n):
        total += i
    return total


def is_prime(num):
    """
    Check if a number is prime
    There's also a subtle bug here!
    """
    if num <= 1:
        return False
    if num == 2:
        return True
    if num % 2 == 0:
        return False
    
    for i in range(3, num, 2):
        if num % i == 0:
            return False
    return True


def find_max(numbers):
    """
    Find the maximum number in a list
    Another bug lurks here!
    """
    if not numbers:
        return None
    
    max_num = numbers[0]
    for i in range(1, len(numbers) - 1):
        if numbers[i] > max_num:
            max_num = numbers[i]
    return max_num


def reverse_string(s):
    """
    Reverse a string
    One more bug to find!
    """
    result = ""
    for i in range(len(s)):
        result += s[len(s) - 1 - i]
    return result[:-1] 