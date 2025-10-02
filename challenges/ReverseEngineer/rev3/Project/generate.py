import sys

# output C-style array of hex-bytes
def obfu_flag(flag:str):
    oflag = []

    i = 0
    k = 0
    r = 4

    # iterate over string given at main
    for l in flag:
        n = ord(l) # get numeric value of char
        
        # bit-shifting
        m = n << (i + r)

        # integer division
        m = int(m / (k+1))

        # mod operation
        p = m % ord('A')

        # make hex
        h = hex(p)

        i += 1
        oflag.append(h)

    # Convert strings to integers and format as C-style hex
    c_array = ', '.join(f'0x{int(x, 16):02x}' for x in oflag)

    # Print the final C array
    print(f"unsigned char arr[] = {{{c_array}}};")

def main():
    if len(sys.argv) != 2:
        print(f'Usage: {sys.argv[0]} FLAG')
        return;
    obfu_flag(sys.argv[1])

if __name__ == "__main__":
    main()
