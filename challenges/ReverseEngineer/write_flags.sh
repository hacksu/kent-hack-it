#!/bin/bash

echo '[*] Writing Flag Files. . .'

echo 'khi{y0u_d3f3473d_MF4_br0}' > /home/programmer/flag.txt
echo 'khi{du3s_pwn3d_by_ghidr4}' > /home/programmer2/flag.txt

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