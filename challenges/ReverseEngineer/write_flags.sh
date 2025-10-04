#!/bin/bash

echo '[*] Writing Flag Files. . .'

echo $FLAG1 > /home/programmer/flag.txt
echo $FLAG2 > /home/programmer2/flag.txt

echo '[*] Clearing ENV. . .'

# clear from env so users cannot see flags
# for other challenges
unset FLAG1
unset FLAG2

echo '[*] Preparing SOCATs. . .'

# Prepare programs
cd /home/programmer
g++ mfa.cpp -o mfa
cat > runner.sh <<EOF
#!/bin/bash
echo "Starting Program. . ."
python3 /home/programmer/authenticator.py
echo "Program Ended. . ."
EOF
chmod +x runner.sh

# build C++ project
cd /home/programmer2
mkdir build
cd build
cmake ../ && make && cp ./bin/tunnet /home/programmer2/tunnet && cd /home/programmer2 && rm -rf build

cat > runner.sh <<EOF
#!/bin/bash
echo "Starting Program. . ."
/home/programmer2/tunnet
echo "Program Ended. . ."
EOF
chmod +x runner.sh

echo '[*] Fixing Ownerships. . .'

# Change ownerships
chown -R programmer:programmer /home/programmer
chown -R programmer:programmer2 /home/programmer2

echo '[+] Finished!'