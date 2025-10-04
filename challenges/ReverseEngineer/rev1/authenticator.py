import os

username = "w3eblR"
password = "s3cUr1tYExprT_"

def show_timezone():
    from datetime import datetime, timedelta

    # Get current local time
    now = datetime.now()

    # Subtract 10 minutes
    adjusted_time = now - timedelta(minutes=10)

    # Format in AM/PM (12-hour clock)
    t = adjusted_time.strftime("%I:%M %p")
    print(f"[DEBUG] It was {t} | 10 minutes ago. . .")

def enter_code(code):
    # accept 15 attempts
    for i in range(0,15):
        s = input('Enter Code > ')

        if str(code) == str(s):
            print("Access Granted!")
            with open('/home/programmer/flag.txt','r') as f:
                print(f.readline())
            return
        else:
            print("Access Denied!")

def main():
    result = os.system(f"/home/programmer/mfa {username} {password} > /home/programmer/out.txt")
    if (result == 0):
        # read out.txt
        with open('/home/programmer/out.txt','r') as f:
            line = f.readline()
        code = line.strip().split()[2]
        show_timezone()
        enter_code(code)
    else:
        print("[-] Error occured executing program!")

if __name__ == "__main__":
    main()
