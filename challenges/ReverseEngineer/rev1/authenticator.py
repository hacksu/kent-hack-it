import os, socket

username = "w3eblR"
password = "s3cUr1tYExprT_"

def listener(code):
    serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    serversocket.bind(('0.0.0.0', 4444))
    serversocket.listen()
    
    print("[*] Listening. . .")
    print(f" |___solution: {code}")
    while (True):
        connection, address = serversocket.accept()
        connection.send(b'Enter MFA: ')
        
        print(f"[+] Incoming Connection from {address}")
        # Handle Single Connection
        recvBuffer = connection.recv(64) # size of recv bytes we allow
        if len(recvBuffer) > 0:
            if str(code) == str(recvBuffer.decode().strip()):
                connection.send(b'YIPPE!')
            else:
                connection.send(b'Invalid!')
        connection.close()
    serversocket.close()

def main():
    result = os.system(f"./mfa {username} {password} > out.txt")
    if (result == 0):
        # read out.txt
        with open('./out.txt','r') as f:
            line = f.readline()
        print(line)
        code = line.strip().split()[2]
        listener(code)
    else:
        print("[-] Error occured executing program!")

if __name__ == "__main__":
    main()
