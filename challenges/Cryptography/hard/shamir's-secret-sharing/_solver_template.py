#!/usr/bin/env python3
"""
Shamir's Secret Sharing Solver Template
Complete this template to solve the challenge.
"""

def mod_inverse(a, m):
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

def lagrange_interpolation(shares, prime):
    """
    Reconstruct secret using Lagrange interpolation.
    
    Args:
        shares: List of (x, y) coordinate pairs
        prime: The prime modulus used
    
    Returns:
        The secret (value at x=0)
    """
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

def int_to_string(n):
    """Convert integer back to string."""
    byte_length = (n.bit_length() + 7) // 8
    return n.to_bytes(byte_length, 'big').decode('utf-8')

def main():
    # TODO: Fill in the prime from cipher.txt
    prime = 0
    
    # TODO: Fill in the coordinate pairs you found
    coordinate_pairs = []
    
    # Reconstruct the secret
    secret_int = lagrange_interpolation(coordinate_pairs, prime)
    
    # Convert back to text
    try:
        secret_text = int_to_string(secret_int)
        print(f"Reconstructed secret: {secret_text}")
        
        # Verify it looks like a flag
        if secret_text.startswith('khi{') and secret_text.endswith('}'):
            print("SUCCESS! This looks like a valid flag.")
        else:
            print("Hmm, this doesn't look like a flag. Check your coordinates.")
            
    except Exception as e:
        print(f"Error converting to text: {e}")
        print("The reconstructed integer might be wrong.")

if __name__ == "__main__":
    main()
