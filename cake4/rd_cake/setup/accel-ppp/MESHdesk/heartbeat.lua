#!/usr/bin/lua

-- Include libraries
package.path = "libs/?.lua;" .. package.path

--[[--
This script will typically be started during the setup of Accel-ppp

--]]--a

require("rdLogger");

debug 	    = true;
interval    = 120;
ping_sleep  = 30;

local socket    = require("socket");
local inifile   = require('inifile');
local l         = rdLogger();

--This is for the new reporting system--
local int_light     = 60
local int_full      = 300
local int_sampling  = 60

local cntr_light    = 0;
local cntr_full     = 0;
local cntr_sampling = 0;

--======================================
---- Some general functions -----------
--=====================================
function log(m,p)
	if(debug)then                                                                                     
        print(m); --Print to std out when debug set                                                                                   
	end
    l:log(m,p)                              
end
                                                                                                       
function sleep(sec)
	socket.select(nil, nil, sec)                                                                          
end 

function file_exists(name)
    local f=io.open(name,"r")
    if f~=nil then 
        io.close(f) 
        return true; 
    else 
        return false; 
    end
end 

function light_report()
    log("Light Reporting");
    os.execute("/etc/MESHdesk/reporting/report_to_server.lua light");
end

function reporting_loop()
    local loop = true;   
    while(loop)do          
	    sleep(1);
	    cntr_light      = cntr_light + 1;
	    if(cntr_light == int_light)then
	        cntr_light = 0;
	        light_report();
	    end 
    end
end

reporting_loop();

