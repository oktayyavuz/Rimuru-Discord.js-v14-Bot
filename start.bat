@echo off
title Rimuru 
:run
node .
echo Bot crashed! Restarting in 5 seconds...
timeout /t 5
goto run
