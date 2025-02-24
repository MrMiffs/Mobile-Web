#!/bin/bash

scp html/* Linode:/var/www/html/
scp jsapp/* Linode:/var/www/jsapp/
ssh Linode systemctl restart jsapp
