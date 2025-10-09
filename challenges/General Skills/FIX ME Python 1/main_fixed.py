# CORRECTED VERSION - This is what participants need to achieve

def calculate_sum(n):
    """
    Calculate the sum of numbers from 1 to n
    FIXED: Changed range(1, n) to range(1, n+1) to include n
    """
    total = 0
    for i in range(1, n + 1):  # FIXED: was range(1, n)
        total += i
    return total


def is_prime(num):
    """
    Check if a number is prime
    FIXED: Changed loop condition for efficiency and correctness
    """
    if num <= 1:
        return False
    if num == 2:
        return True
    if num % 2 == 0:
        return False
    
    # FIXED: Only check up to square root of num for efficiency
    for i in range(3, int(num**0.5) + 1, 2):  # FIXED: was range(3, num, 2)
        if num % i == 0:
            return False
    return True


def find_max(numbers):
    """
    Find the maximum number in a list
    FIXED: Check all elements, including the last one
    """
    if not numbers:
        return None
    
    max_num = numbers[0]
    for i in range(1, len(numbers)):  # FIXED: was range(1, len(numbers) - 1)
        if numbers[i] > max_num:
            max_num = numbers[i]
    return max_num


def reverse_string(s):
    """
    Reverse a string
    FIXED: Don't remove the last character
    """
    result = ""
    for i in range(len(s)):
        result += s[len(s) - 1 - i]
    return result  # FIXED: removed [:-1] which was cutting off last char