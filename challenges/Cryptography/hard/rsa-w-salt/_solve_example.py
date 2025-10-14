import rsa
import base64
import os

# Get the directory of this script
script_dir = os.path.dirname(os.path.abspath(__file__))
priv_path = os.path.join(script_dir, '_key.priv')
cipher_path = os.path.join(script_dir, '_cipher.txt')

with open(priv_path, 'r') as f:
	priv_key = rsa.PrivateKey.load_pkcs1(f.read().encode())

with open(cipher_path, 'r') as f:
	ciphertext_b64 = f.readline().strip()
	ciphertext = base64.b64decode(ciphertext_b64)

decrypted = rsa.decrypt(ciphertext, priv_key)
salt_len = 16  # from challenge
flag = decrypted[salt_len:].decode()
print(flag)