#!/usr/bin/lua
--[[--
Startup script to get the config of the device from the config server
--]]--

-- Include libraries
package.path = "libs/?.lua;" .. package.path;

local http  = require("socket.http");
local cjson = require("cjson");
local requesrString = "http://127.0.0.1/cake4/rd_cake/accel-servers/get-config-for-server.json?mac=64-64-4A-D1-2D-67";
local body, code = http.request(requesrString);

print(code);

local jsonDict = cjson.decode(body);
local txtConf  = '';


function printAll(t, level)
    --print("==Looping Level "..level);
    for k, v in pairs(t) do
        if(type(k) == 'string')then
            if(level == 0)then
                --print("\n["..k.."]");
                txtConf=txtConf.."\n\n["..k.."]";
            else                
                if(type(v) == 'string')then
                    print(k);
                    if((k == 'pools')or(k == 'server' ))then
                        txtConf=txtConf.."\n"..v;
                    else                    
                        if(tonumber(k))then
                            --print(v);
                            txtConf=txtConf.."\n"..v;
                        else
                            --print(k..'='..v);
                            txtConf=txtConf.."\n"..k..'='..v;
                        end                       
                    end                   
                end
                if(type(v) == 'number')then
                    --print(k..'='..v);
                    txtConf=txtConf.."\n"..k..'='..v;
                end               
            end
            -- print(type(v));
            if(type(v) == 'table')then
                printAll(v,level+1);    
            end
        end
        if(type(k)== 'number')then
            --print(v);
            txtConf=txtConf.."\n"..v;
        end
    end
end

if((jsonDict.success ~= nil)and(jsonDict.success == true))then
    if(jsonDict.data ~= nil)then  
        printAll(jsonDict.data,0);
        print("===============");
     --   print(txtConf);
    end   
end

local file = io.open( "/home/system/accel-ppp.conf", "w" )
if( io.type( file ) == "file" ) then
    file:write(txtConf)
    file:close();
    os.execute('cp /home/system/accel-ppp.conf /etc/accel-ppp.conf'); 
    os.execute('/etc/init.d/accel-ppp restart'); 	
else
	print( "--error--" )
end

