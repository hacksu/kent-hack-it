# CORRECTED VERSION - This is what participants need to achieve
# Fix Me Python 2 Challenge - Medium Difficulty Solutions

def fibonacci(n):
    """
    Calculate the nth Fibonacci number using recursion
    FIXED: Changed fibonacci(n-1) + fibonacci(n-1) to fibonacci(n-1) + fibonacci(n-2)
    """
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fibonacci(n-1) + fibonacci(n-2)  # FIXED: was fibonacci(n-1) + fibonacci(n-1)


def merge_sorted_lists(list1, list2):
    """
    Merge two sorted lists into one sorted list
    FIXED: Added the missing while loop to append remaining elements from list2
    """
    result = []
    i, j = 0, 0
    
    while i < len(list1) and j < len(list2):
        if list1[i] <= list2[j]:
            result.append(list1[i])
            i += 1
        else:
            result.append(list2[j])
            j += 1
    
    # Append remaining elements from list1
    while i < len(list1):
        result.append(list1[i])
        i += 1
    
    # FIXED: Added missing loop to append remaining elements from list2
    while j < len(list2):
        result.append(list2[j])
        j += 1
    
    return result


def count_word_frequency(text):
    """
    Count the frequency of each word in a text string
    FIXED: Handle case sensitivity and punctuation
    """
    import re
    # FIXED: Convert to lowercase and remove punctuation
    words = re.findall(r'\b[a-zA-Z]+\b', text.lower())  # FIXED: was just text.split()
    frequency = {}
    
    for word in words:
        if word in frequency:
            frequency[word] += 1
        else:
            frequency[word] = 1
    
    return frequency


def binary_search(arr, target):
    """
    Perform binary search on a sorted array
    FIXED: Changed right initialization from len(arr) to len(arr) - 1
    """
    left, right = 0, len(arr) - 1  # FIXED: was len(arr)
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1


def flatten_nested_list(nested_list):
    """
    Flatten a nested list of arbitrary depth
    This function was actually correct as written
    """
    result = []
    
    for item in nested_list:
        if isinstance(item, list):
            result.extend(flatten_nested_list(item))
        else:
            result.append(item)
    
    return result


def find_missing_number(nums):
    """
    Find the missing number in a list that should contain 0 to n
    FIXED: Corrected the expected sum formula
    """
    n = len(nums)  # FIXED: was len(nums) + 1
    expected_sum = n * (n + 1) // 2  # FIXED: formula is now correct for 0 to n
    actual_sum = sum(nums)
    
    return expected_sum - actual_sum