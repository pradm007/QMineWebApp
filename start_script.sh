#!/bin/bash
nohup redis-server &
nohup make server > /var/log/qmine_c.out &
pm2 start app.js -l /var/log/qmine_node.out
frontail /var/log/qmine_c.out /var/log/qmine_node.out

# now we bring the primary process back into the foreground
# and leave it there
fg %1