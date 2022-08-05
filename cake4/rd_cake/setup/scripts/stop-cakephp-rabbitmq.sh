#! /bin/bash
# Authors: Aphelion Team

if [ -f /tmp/cakephp-rabbitmq.log ]; then
    RUNNING_PIDS=$(cat "/tmp/cakephp-rabbitmq.log" | tail -10)
    for rpid in $RUNNING_PIDS; do
        kill -9 $rpid
    done
    rm -f /tmp/cakephp-rabbitmq.log
fi
