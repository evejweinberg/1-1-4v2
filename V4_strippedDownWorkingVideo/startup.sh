#!/bin/sh
        export PATH=$PATH:/usr/local/bin
        if [ $(ps ax | grep -v grep | grep "python -m SimpleHTTPServer 1234" | wc -l) -eq 0 ]
        then
                echo "Starting local server at port 1234, cityscape..."
                cd /Users/Aloni/audicity ; python -m SimpleHTTPServer 1234
        else
		echo "already running."
        fi
