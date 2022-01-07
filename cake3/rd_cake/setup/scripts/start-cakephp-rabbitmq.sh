#! /bin/bash
# Authors: Aphelion Team

touch /tmp/cakephp-rabbitmq.log && chmod 777 /tmp/cakephp-rabbitmq.log

echo "Starting CakePHP RabbitMQ Console Application" > /tmp/cakephp-rabbitmq.log

CONSOLE_WORKING_DIR=/var/www/html/cake3/rd_cake/

for ((i=1;i<=10;i++)); do
    cd $CONSOLE_WORKING_DIR
    bin/cake rabbitmq >> /dev/null 2>&1 &
    CRPID=$!
    echo $CRPID >> /tmp/cakephp-rabbitmq.log
done

disown -a && exit
