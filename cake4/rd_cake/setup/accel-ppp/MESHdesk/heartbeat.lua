#!/usr/bin/lua

-- Include libraries
package.path = "libs/?.lua;" .. package.path

--[[--
This script will typically be started during the setup of Accel-ppp

--]]--a

require("rdLogger");
--require('rdConfig');
--require('rdNetwork');
--require('rdJsonReports');

debug 	    = true;
interval    = 120;
ping_sleep  = 30;

local socket    = require("socket");
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
    --os.execute("/etc/MESHdesk/reporting/report_to_server.lua light");
    --actions_checker();
    --dynamic_gateway(); --We also include the dynamic gateway bit here  
end

function dynamic_gateway()
    os.execute("/etc/MESHdesk/reporting/dynamic_gateway.lua")
end

function actions_checker()
    os.execute("/etc/MESHdesk/reporting/check_for_actions.lua")
end

function full_report()
    log("Full Reporting");
    --os.execute("/etc/MESHdesk/reporting/report_to_server.lua full");
    --actions_checker();
end

function do_sample()
    --os.execute("/etc/MESHdesk/reporting/report_sampling.lua");
end


function reporting_loop()
    local loop = true;
     
    while(loop)do          
	    sleep(1);
	    cntr_light      = cntr_light + 1;
	    cntr_full       = cntr_full + 1;
	    cntr_sampling   = cntr_sampling + 1;
	    
	    if(cntr_sampling == int_sampling)then --First sample before report
	        cntr_sampling = 0;
	        do_sample();
	        --collect_data();
	    end	
	    
	    if(cntr_light == int_light)then
	        cntr_light = 0;
	        light_report();
	    end
	    
	    if(cntr_full == int_full)then
	        cntr_full = 0;
	        full_report();
	    end
  
    end
end

function conn_test_loop()
    --Will only reach here when it could reach the MD server
    reporting_loop();  
end

--=== BEGIN HERE ===---
conn_test_loop();

