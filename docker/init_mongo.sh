#!/bin/bash
# THIS SCRIPT IS RESPONSIBLE FOR CREATING THE SUPER ADMIN
# FOR THE KHI WEBSITE (THIS ADMIN CANNOT BE REMOVED FROM THE ADMIN PANEL)

username="admin" # OPTIONAL to change
password="admin" # CHANGE THIS IN PRODUCTION

salt="" # SALT .env
hashed=$(echo -n "${salt}${password}" | sha256sum | awk '{print $1}')

mongosh -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin "$MONGO_INITDB_DATABASE" <<EOF
db.admins.insertOne({
  username: "$username",
  password: "$hashed",
  isProtected: true,
  created_at: new Date()
});
EOF > /root/init_mongo.log