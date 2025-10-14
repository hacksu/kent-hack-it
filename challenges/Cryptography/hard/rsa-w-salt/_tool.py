# RSA with salt CTF challenge generator

import rsa
import base64
import os

def generate_rsa_challenge(flag: str, salt_len: int = 16):
	# Generate RSA key pair with a weak modulus (vulnerability for CTF)
	pubkey, privkey = rsa.newkeys(512)

	# Generate random salt
	salt = os.urandom(salt_len)

	# Concatenate salt + flag
	message = salt + flag.encode()

	# Encrypt with RSA public key
	ciphertext = rsa.encrypt(message, pubkey)

	# Output for challenge (relative to script location)
	script_dir = os.path.dirname(os.path.abspath(__file__))
	pub_path = os.path.join(script_dir, '_key.pub')
	priv_path = os.path.join(script_dir, '_key.priv')
	cipher_path = os.path.join(script_dir, '_cipher.txt')

	with open(pub_path, 'w') as f:
		f.write(pubkey.save_pkcs1().decode())
	with open(priv_path, 'w') as f:
		f.write(privkey.save_pkcs1().decode())
	with open(cipher_path, 'w') as f:
		f.write(base64.b64encode(ciphertext).decode() + '\n')
		f.write(f'Salt length: {salt_len} bytes\n')
	print(f'Files written: {pub_path}, {priv_path}, {cipher_path}')


if __name__ == "__main__":
	# Example flag
	flag = "khi{Th3_sa1TYneSs}"
	salt_len = 16
	generate_rsa_challenge(flag, salt_len)
