# Fix Me Python 2 Challenge - Medium Difficulty
# There are subtle bugs in the functions below - can you find and fix them?
# Run oracle.pyc to test your fixes!
#
# This challenge tests more advanced Python concepts:
# - Recursion and base cases
# - List/dictionary manipulation 
# - Algorithm correctness
# - Edge case handling

def fibonacci(n):
    """
    Calculate the nth Fibonacci number using recursion
    There's a bug in the base case logic!
    """
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fibonacci(n-1) + fibonacci(n-1)


def merge_sorted_lists(list1, list2):
    """
    Merge two sorted lists into one sorted list
    There's a subtle indexing bug here!
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
    
    while i < len(list1):
        result.append(list1[i])
        i += 1
    
    return result


def count_word_frequency(text):
    """
    Count the frequency of each word in a text string
    There's a case sensitivity and punctuation bug!
    """
    words = text.split()
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
    There's a classic off-by-one error hiding here!
    """
    left, right = 0, len(arr)
    
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
    There's a type checking bug in the recursion!
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
    There's a mathematical logic error!
    """
    n = len(nums) + 1
    expected_sum = n * (n + 1) // 2
    actual_sum = sum(nums)
    
    return expected_sum - actual_sum