#!/bin/sh

# node server.js
# read -p 'PRESS ANY KEY TO TERNINATE...'

CWD=`pwd`
mintty -t "USR" -p   64,0  -s 165,65  --exec sh -c "cd $CWD; node server.js; read -p '➔ PRESS ENTER TO TERNINATE...'"
#----------------p 1364,0---------54 
#--------------------------------111
