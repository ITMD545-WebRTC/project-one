# !/usr/bin/env zsh

# Set a crontab to run this script every five minutes
# */5 * * * * /path/to/fetch-abc.sh

# See http://zsh.sourceforge.net/Doc/Release/Expansion.html#Modifiers
# cd "$0:a:h:h/output"
touch worldometers_data.html
curl -o worldometers_data.html https://www.worldometers.info/coronavirus/#news
exit
