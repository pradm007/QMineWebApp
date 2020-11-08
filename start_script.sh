# #!/bin/bash
# redis-server &
# cd /home/QMineWebApp/ && pm2 start app.js -l /var/log/qmine_node.out &
# cd /home/QMine_miningregex_core/ && make server > /var/log/qmine_c.out
# # frontail /var/log/qmine_c.out /var/log/qmine_node.out

# # now we bring the primary process back into the foreground
# # and leave it there
# # fg %1

# # /bin/bash

#!/bin/bash
redis-server  --daemonize yes

cd /home/QMine_miningregex_core
echo "In directory "
pwd
make server >> /var/log/qmine_c.out &

cd /home/QMineWebApp
echo "In directory "
pwd
forever start -a -l /var/log/qmine_node.out app.js

frontail /var/log/qmine_c.out /var/log/qmine_node.out
