Webservers that only use http do not secure data traffic. In this challenge we are abusing plaintext over HTTP

Solution Method:

Open the PCAP in wireshark file and look for requests to the webserver.
Filter for HTTP traffic and look for GET/Fetch requests. You'll find a request to `/secret.log` which the response contains the flag in the response body.

Data looks like the following:

```
V09NUCBXT01QIE5PUEU=
a2hpe1czQl8xU05UX1MzQ1VSM30=
TmljZSBUcnkgQnV0IE5PIExPTA==
```

These are base64 strings and the middle one is the correct flag. Convert then Submit


Flag: khi{W3B_1SNT_S3CUR3}