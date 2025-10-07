#!/usr/bin/env python3
"""
Generate Shamir's Secret Sharing cipher for the Kent Hack It challenge.
The secret is: khi{byzantine_resilient_self_stabilizing_systems}
"""

import random
from typing import List, Tuple

def string_to_int(s: str) -> int:
    """Convert string to integer representation."""
    return int.from_bytes(s.encode('utf-8'), 'big')

def int_to_string(n: int) -> str:
    """Convert integer back to string."""
    try:
        byte_length = (n.bit_length() + 7) // 8
        return n.to_bytes(byte_length, 'big').decode('utf-8')
    except UnicodeDecodeError:
        # If direct conversion fails, the number might be wrong
        return f"[Error: Cannot decode integer {n} to string]"

def mod_inverse(a: int, m: int) -> int:
    """Calculate modular inverse using extended Euclidean algorithm."""
    def extended_gcd(a, b):
        if a == 0:
            return b, 0, 1
        gcd, x1, y1 = extended_gcd(b % a, a)
        x = y1 - (b // a) * x1
        y = x1
        return gcd, x, y
    
    gcd, x, y = extended_gcd(a % m, m)
    if gcd != 1:
        raise ValueError("Modular inverse does not exist")
    return (x % m + m) % m

def lagrange_interpolation(shares: List[Tuple[int, int]], prime: int) -> int:
    """Reconstruct secret using Lagrange interpolation."""
    secret = 0
    k = len(shares)
    
    for i in range(k):
        xi, yi = shares[i]
        numerator = 1
        denominator = 1
        
        for j in range(k):
            if i != j:
                xj, _ = shares[j]
                numerator = (numerator * (-xj)) % prime
                denominator = (denominator * (xi - xj)) % prime
        
        # Calculate the Lagrange coefficient
        lagrange_coeff = (numerator * mod_inverse(denominator, prime)) % prime
        secret = (secret + yi * lagrange_coeff) % prime
    
    return secret

def create_shamir_shares(secret: int, threshold: int, num_shares: int, x_values: List[int], prime: int) -> List[Tuple[int, int]]:
    """Create Shamir's Secret Sharing shares."""
    # Generate random coefficients for polynomial of degree (threshold-1)
    coefficients = [secret] + [random.randint(1, prime-1) for _ in range(threshold-1)]
    
    shares = []
    for i, x in enumerate(x_values):
        # Evaluate polynomial at x: f(x) = a0 + a1*x + a2*x^2 + ... + a(k-1)*x^(k-1)
        y = 0
        for j, coeff in enumerate(coefficients):
            y = (y + coeff * pow(x, j, prime)) % prime
        shares.append((x, y))
    
    return shares

def main():
    # The secret message
    secret_text = "khi{byzantine_resilient_self_stabilizing_systems}"
    print(f"Secret text: {secret_text}")
    
    # Convert to integer
    secret_int = string_to_int(secret_text)
    print(f"Secret as integer: {secret_int}")
    
    # Parameters
    threshold = 6  # Need 6 shares to reconstruct
    num_shares = 10  # Total shares
    
    # X-values correspond to the numbers found on Dr. Nesterenko's website
    x_values = [50, 67, 1820, 400, 34, 16, 124, 136, 5, 10]
    
    # Use a large prime (larger than the secret and all x-values)
    prime = 6864797660130609714981900799081393217269435300143305409394463459185543183397656052122559640661454554977296311391480858037121987999716643812574028291115057151  # Known working prime
    
    # Create shares
    shares = create_shamir_shares(secret_int, threshold, num_shares, x_values, prime)
    
    print(f"\nGenerated {num_shares} shares (threshold = {threshold}):")
    for i, (x, y) in enumerate(shares, 1):
        print(f"Share {i}: ({x}, {y})")
    
    # Test reconstruction with first 6 shares
    test_shares = shares[:threshold]
    print(f"\nTesting reconstruction with shares: {test_shares}")
    reconstructed = lagrange_interpolation(test_shares, prime)
    
    print(f"Original secret integer: {secret_int}")
    print(f"Reconstructed integer: {reconstructed}")
    
    try:
        reconstructed_text = int_to_string(reconstructed)
        print(f"Reconstructed text: {reconstructed_text}")
        print(f"Success: {reconstructed_text == secret_text}")
    except Exception as e:
        print(f"Error in reconstruction: {e}")
        print("This suggests an issue with the mathematical implementation")
    
    # Generate _output.txt content - provide coordinate pairs clearly
    cipher_content = f"""Dr. Nesterenko's Research Fragments
===================================

Threshold: 6 of 10
Prime: {prime}

Coordinate Pairs (x,y):
"""
    
    for x, y in shares:
        cipher_content += f"({x}, {y})\n"
    
    # Write to _output.txt
    with open('_output.txt', 'w') as f:
        f.write(cipher_content)
    
    print(f"\nCipher content written to _output.txt")

if __name__ == "__main__":
    main()