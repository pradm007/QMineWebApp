FROM ubuntu:18.04

LABEL "qmine_pradeep_mahato" "v1.0"

WORKDIR /home/

RUN apt update
RUN apt install -qq -y nodejs npm redis-server libboost-all-dev git vim ragel make cmake software-properties-common wget htop 
RUN cp /etc/redis/redis.conf /etc/redis/redis.conf.default
RUN redis-server /etc/redis/redis.conf

WORKDIR /usr/local
# RUN apt-get install -qq -y software-properties-common wget
# RUN wget https://github.com/Kitware/CMake/releases/download/v3.15.2/cmake-3.15.2.tar.gz && tar -zxvf cmake-3.15.2.tar.gz && cd cmake-3.15.2 && ./bootstrap && make && make install

RUN git clone https://github.com/redis/hiredis.git

WORKDIR /usr/local/hiredis
RUN make
RUN make install

WORKDIR /usr/local
RUN git clone https://github.com/sewenew/redis-plus-plus.git
WORKDIR /usr/local/redis-plus-plus
RUN mkdir compile
WORKDIR /usr/local/redis-plus-plus/compile
RUN cmake -DCMAKE_BUILD_TYPE=Release ..
RUN make
RUN make install

WORKDIR /home

RUN touch /var/log/qmine_c.out
RUN touch /var/log/qmine_node.out

RUN git clone https://github.com/pradm007/QMine_miningregex_core.git

WORKDIR /home/QMine_miningregex_core
RUN git checkout redis_threadable


# RUN nohup redis-server &
# RUN nohup make server > /var/log/qmine_c.out &
WORKDIR /home

RUN git clone https://github.com/pradm007/QMineWebApp.git
WORKDIR /home/QMineWebApp
RUN git checkout dev && npm install --silent
RUN npm install --silent -g pm2 frontail forever
# RUN pm2 start app.js -l /var/log/qmine_node.out
RUN ls
RUN chmod 777 /home/QMineWebApp/start_script.sh

# RUN npm i frontail --quiet -g
EXPOSE 5000

# CMD frontail /var/log/qmine_c.out /var/log/qmine_node.out
WORKDIR /home

RUN ls && pwd

# ENTRYPOINT "/bin/bash"
# ENTRYPOINT nohup redis-server && bash && cd QMine_miningregex_core && nohup make server && cd /home && node QMineWebApp/app.js
# CMD redis-server
ADD start_script.sh /QMineWebApp/start_script.sh
ENTRYPOINT sh QMineWebApp/start_script.sh && bash


# CMD ["sh", "/home/QMineWebApp/start_script.sh"]
# CMD ./home/QMineWebApp/start_script.sh
# CMD node QMineWebApp/app.js