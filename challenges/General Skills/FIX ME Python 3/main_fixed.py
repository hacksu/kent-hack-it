# CORRECTED VERSION - This is what participants need to achieve
# Fix Me Python 3 Challenge - Hard Difficulty Solutions

import functools
from contextlib import contextmanager

def memoize(func):
    """
    Decorator that caches function results
    FIXED: Handle unhashable types gracefully in cache key generation
    """
    cache = {}
    
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # FIXED: Handle unhashable types by converting to string representation
        try:
            # Try to create a hashable key
            key = args + tuple(sorted(kwargs.items()))
        except TypeError:
            # If unhashable types exist, create a string-based key
            try:
                key = str(args) + str(sorted(kwargs.items()))
            except TypeError:
                # If even kwargs can't be sorted, use repr
                key = repr(args) + repr(kwargs)
        
        if key not in cache:
            cache[key] = func(*args, **kwargs)
        return cache[key]
    
    return wrapper


class BinarySearchTree:
    """
    Binary Search Tree implementation
    FIXED: Proper duplicate handling and search method
    """
    
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
    
    def insert(self, value):
        """Insert a value into the BST"""
        if value < self.value:
            if self.left is None:
                self.left = BinarySearchTree(value)
            else:
                self.left.insert(value)
        elif value > self.value:  # FIXED: Added elif to handle duplicates properly
            if self.right is None:
                self.right = BinarySearchTree(value)
            else:
                self.right.insert(value)
        # FIXED: Duplicates are ignored (common BST behavior)
    
    def search(self, value):
        """Search for a value in the BST"""
        if value == self.value:
            return True
        elif value < self.value:
            return self.left.search(value) if self.left else False  # FIXED: proper None check
        else:
            return self.right.search(value) if self.right else False  # FIXED: proper None check


def fibonacci_generator(n):
    """
    Generate the first n Fibonacci numbers
    FIXED: Correct loop condition
    """
    if n <= 0:
        return
    
    a, b = 0, 1
    count = 0
    
    while count < n:  # FIXED: was count <= n
        yield a
        a, b = b, a + b
        count += 1


class CustomList:
    """
    Custom list implementation with advanced features
    FIXED: Proper type checking in magic methods
    """
    
    def __init__(self, items=None):
        self.items = items or []
    
    def __len__(self):
        return len(self.items)
    
    def __getitem__(self, index):
        return self.items[index]
    
    def __setitem__(self, index, value):
        self.items[index] = value
    
    def __add__(self, other):
        # FIXED: Handle different types properly
        if isinstance(other, CustomList):
            return CustomList(self.items + other.items)
        elif isinstance(other, list):
            return CustomList(self.items + other)
        else:
            raise TypeError(f"Cannot add CustomList and {type(other)}")
    
    def __eq__(self, other):
        # FIXED: Check type before comparing
        if isinstance(other, CustomList):
            return self.items == other.items
        elif isinstance(other, list):
            return self.items == other
        else:
            return False
    
    def append(self, item):
        self.items.append(item)


@contextmanager
def file_manager(filename, mode='r'):
    """
    Context manager for file handling
    FIXED: Proper exception handling with file variable scope
    """
    file = None
    try:
        file = open(filename, mode)
        yield file
    except Exception as e:
        print(f"Error: {e}")
        yield None  # FIXED: yield None when error occurs
    finally:
        if file is not None:  # FIXED: check if file was successfully opened
            file.close()


def dijkstra_shortest_path(graph, start, end):
    """
    Find shortest path using Dijkstra's algorithm
    FIXED: Use set for visited nodes and handle unreachable nodes
    """
    import heapq
    
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    previous = {}
    
    # FIXED: Use set for O(1) lookup instead of list
    visited = set()
    heap = [(0, start)]
    
    while heap:
        current_dist, current = heapq.heappop(heap)
        
        if current in visited:
            continue
        
        visited.add(current)  # FIXED: Use set.add() for O(1) operation
        
        if current == end:
            break
        
        for neighbor, weight in graph[current].items():
            distance = current_dist + weight
            
            if distance < distances[neighbor] and neighbor not in visited:  # FIXED: Added visited check
                distances[neighbor] = distance
                previous[neighbor] = current
                heapq.heappush(heap, (distance, neighbor))
    
    # Reconstruct path - FIXED: Handle unreachable destinations
    if end not in previous and start != end:
        return [], float('inf')  # FIXED: Return empty path for unreachable nodes
    
    path = []
    current = end
    
    while current is not None:
        path.append(current)
        current = previous.get(current)
    
    path.reverse()
    return path, distances[end]


class LazyEvaluator:
    """
    Lazy evaluation class that computes values only when needed
    FIXED: Proper reset method and call behavior
    """
    
    def __init__(self, computation_func):
        self.computation_func = computation_func
        self._computed = False
        self._value = None
    
    @property
    def value(self):
        if not self._computed:
            self._value = self.computation_func()
            self._computed = True
        return self._value
    
    def reset(self):
        """Reset the lazy evaluator to recompute on next access"""
        self._computed = False
        self._value = None  # FIXED: Clear cached value to prevent memory leaks
    
    def __call__(self):
        # FIXED: Return cached value, not direct computation
        return self.value


def advanced_sort(items, key_func=None, reverse=False):
    """
    Advanced sorting with custom key function and reverse option
    FIXED: Create copy of list instead of modifying original
    """
    if key_func is None:
        key_func = lambda x: x
    
    # FIXED: Create a copy instead of modifying the original
    sorted_items = items.copy()
    sorted_items.sort(key=key_func, reverse=reverse)
    
    return sorted_items  # FIXED: Return new sorted list, original unchanged