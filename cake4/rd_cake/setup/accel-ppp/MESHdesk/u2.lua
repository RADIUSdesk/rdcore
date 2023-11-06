#!/usr/bin/lua
--[[--
Startup script to get the config of the device from the config server

'/etc/accel-ppp-rd.conf'


[internet]
disabled=0
dns=cloud.radiusdesk.com
url=cake4/rd_cake/nodes/get-config-for-node.json
status_url=cake4/rd_cake/node-reports/submit_report.json
actions_url=cake4/rd_cake/node-actions/get_actions_for.json
protocol=https
http_port=80
https_port=443
ip=164.160.89.129
interface=enp0s8


--]]--

-- Include libraries
package.path        = "libs/?.lua;" .. package.path;
local cjson         = require("cjson");
local socket        = require("socket");
local inifile       = require('inifile');
local result_file   = '/tmp/result_cfg.json'
local config_file   = '/etc/accel-ppp-rd.conf';
local config_accel  = '/etc/accel-ppp.conf';
local conf_url      = '/cake4/rd_cake/accel-servers/get-config-for-server.json';
local txtConf       = '';
local tmpConfFile   = '/tmp/accel-ppp.conf';

function afterFetch()
    --Read the results
    local f=io.open(result_file,"r")
    if(f)then
        result_string = f:read("*all")
        --print(result_string);
        r = cjson.decode(result_string);
        if((r.success ~= nil)and(r.success == true))then
            local conf_txt = buildConfig(r.data,0); 
            if(string.len(conf_txt) > 10)then
                writeAndRestart(conf_txt);
            end     
        end                                       
    end  
end

function fetchConfig()

    --connecting to the server
    local conf  = inifile.parse(config_file);
    local dns   = conf['internet']['dns'];
    local proto = conf['internet']['protocol'];
    local ip    = conf['internet']['ip'];
    local interface = conf['pppoe']['interface'];
    
    --data to send
    local accel     = inifile.parse(config_accel);
    local interface = accel['pppoe']['interface'];
    local id        = getMac(interface);
    
    local current_ip = socket.dns.toip(dns)
    if(current_ip)then
        if(current_ip ~= ip)then
            ip = current_ip; --update it
            conf['internet']['ip'] = ip;
            inifile.save(config_file, conf);
        end
    end
    print(id);        
    local query     = proto..'://'..ip..conf_url;
    local curl_data = 'mac='..id;
    os.remove(result_file)  
    os.execute('curl -G -k -o '..result_file..' -H "Content-Type: application/json" -d \''..curl_data..'\' '..query);
    afterFetch();
end


function  getMac(interface)
	interface = interface or "eth0"
	io.input("/sys/class/net/" .. interface .. "/address")
	t = io.read("*line")
	dashes, count = string.gsub(t, ":", "-")
	dashes = string.upper(dashes)
	return dashes
end

function buildConfig(t, level)
    --print("==Looping Level "..level);
    for k, v in pairs(t) do
        if(type(k) == 'string')then
            if(level == 0)then
                --print("\n["..k.."]");
                txtConf=txtConf.."\n\n["..k.."]";
            else                
                if(type(v) == 'string')then
                    --print(k);
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
                buildConfig(v,level+1);    
            end
        end
        if(type(k)== 'number')then
            --print(v);
            txtConf=txtConf.."\n"..v;
        end
    end   
    return txtConf;    
end

function writeAndRestart(conf_txt)
    local file = io.open(tmpConfFile, "w" )
    if( io.type( file ) == "file" ) then
        file:write(conf_txt)
        file:close();
        os.execute('cp '..tmpConfFile..' '..config_accel); 
        os.execute('/etc/init.d/accel-ppp restart');
        os.remove(tmpConfFile) 	
    end
end

fetchConfig();

