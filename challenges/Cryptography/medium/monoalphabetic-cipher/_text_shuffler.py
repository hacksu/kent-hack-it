import random

alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
alpha_list = list("abcdefghijklmnopqrstuvwxyz")
random.shuffle(alpha_list)
cap_alpha_list = [c.upper() for c in alpha_list]
shuffle = ''.join(alpha_list) + ''.join(cap_alpha_list)
print(alpha)
print(shuffle)


input_file = f".\\challenges\\Cryptography\\medium\\enigma-machine\\_frequency_matched_text_w_flag.txt"
output_file = f".\\challenges\\Cryptography\\medium\\enigma-machine\\_output_flag.txt"

with open(input_file, 'r', encoding='utf-8') as f_in:
    text = f_in.read()

# Example: encode the text using the shuffled alphabet
table = str.maketrans(alpha, shuffle)
encoded_text = text.translate(table)
encoded_text += '\n'+alpha+'\n'+shuffle

with open(output_file, 'w', encoding='utf-8') as f_out:
    f_out.write(encoded_text)
