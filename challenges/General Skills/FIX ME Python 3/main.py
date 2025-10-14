# Fix Me Python 3 Challenge - Hard Difficulty
# There are complex bugs in the functions and classes below - can you find and fix them?
# Run oracle.pyc to test your fixes!
#
# This challenge tests advanced Python concepts:
# - Object-oriented programming and inheritance
# - Decorators and function wrappers
# - Generators and iterators
# - Context managers
# - Advanced algorithms and data structures

import functools
from contextlib import contextmanager

def memoize(func):
    """
    Decorator that caches function results
    There's a subtle bug in the cache key generation!
    """
    cache = {}
    
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        # Bug: doesn't handle mutable arguments properly for cache key
        key = args + tuple(kwargs.items())  # This can fail with unhashable types
        
        if key not in cache:
            cache[key] = func(*args, **kwargs)
        return cache[key]
    
    return wrapper


class BinarySearchTree:
    """
    Binary Search Tree implementation
    There are bugs in the insertion and search methods!
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
        else:  # Bug: should be elif value > self.value to handle duplicates
            if self.right is None:
                self.right = BinarySearchTree(value)
            else:
                self.right.insert(value)
    
    def search(self, value):
        """Search for a value in the BST"""
        if value == self.value:
            return True
        elif value < self.value:
            return self.left and self.left.search(value)  # Bug: should check if left exists first
        else:
            return self.right and self.right.search(value)


def fibonacci_generator(n):
    """
    Generate the first n Fibonacci numbers
    There's a bug in the generator logic!
    """
    if n <= 0:
        return
    
    a, b = 0, 1
    count = 0
    
    while count <= n:  # Bug: should be count < n
        yield a
        a, b = b, a + b
        count += 1


class CustomList:
    """
    Custom list implementation with advanced features
    There are bugs in the magic methods!
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
        return CustomList(self.items + other.items)
    
    def __eq__(self, other):
        return self.items == other.items
    
    def append(self, item):
        self.items.append(item)


@contextmanager
def file_manager(filename, mode='r'):
    """
    Context manager for file handling
    There's a bug in the exception handling!
    """
    try:
        file = open(filename, mode)
        yield file
    except Exception as e:
        print(f"Error: {e}")
    finally:
        file.close()


def dijkstra_shortest_path(graph, start, end):
    """
    Find shortest path using Dijkstra's algorithm
    There are bugs in the algorithm implementation!
    """
    import heapq
    
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    previous = {}
    
    visited = []
    heap = [(0, start)]
    
    while heap:
        current_dist, current = heapq.heappop(heap)
        
        if current in visited:
            continue
        
        visited.append(current)
        
        if current == end:
            break
        
        for neighbor, weight in graph[current].items():
            distance = current_dist + weight
            
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous[neighbor] = current
                heapq.heappush(heap, (distance, neighbor))
    
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
    There are bugs in the property and method implementations!
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
    
    def __call__(self):
        return self.computation_func()


def advanced_sort(items, key_func=None, reverse=False):
    """
    Advanced sorting with custom key function and reverse option
    There are bugs in the parameter handling and sorting logic!
    """
    if key_func is None:
        key_func = lambda x: x
    
    items.sort(key=key_func, reverse=reverse)
    
    return items