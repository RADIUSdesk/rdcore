#!/usr/bin/lua
-- Include libraries
package.path = "../libs/?.lua;./libs/?.lua;" .. package.path
require('rdAccelJson');
require('rdLogger');

local result_file   = '/tmp/result.json'
local a_json        = rdAccelJson();
local logger        = rdLogger();
local cjson         = require("cjson");
local socket        = require("socket");
local report        = 'light'; -- can be light or full
local password      = 'testing123';
local inifile       = require('inifile');
local config_file   = '/etc/accel-ppp-rd.conf';
local report_url    = '/cake4/rd_cake/accel-servers/submit-report.json';

if(arg[1])then
    report = arg[1];
end

function file_exists(name)                                                          
        local f=io.open(name,"r")                                                   
        if f~=nil then io.close(f) return true else return false end                
end

function sleep(sec)
	socket.select(nil, nil, sec)                                                                          
end 

function afterReport()
    local ok_flag = false;
    local follow_up = false;
    --Read the results
    local f=io.open(result_file,"r")
    if(f)then
        result_string = f:read("*all")
        print(result_string);
        r = cjson.decode(result_string);
        if(r.success)then
            ok_flag = true;       
        end       
       
        if(r.data)then
            if(r.data.terminate)then --Terminate
                for index, value in pairs(r.data.terminate) do
                    follow_up = true;
                    print("Terminate "..value);
                    os.execute('accel-cmd -P '..password..' terminate sid '..value);   
                end
            end
            if(r.data.restart_service)then --Restart Service
                follow_up = true;
                print("Restart Service");
                os.execute('/etc/init.d/accel-ppp restart');   
            end            
        end                                    
    end
    
    if(follow_up)then
        print("Doing a follow up");
        sleep(10); --Give it enough time to connect again
        lightReport();
    end     
end

function lightReport()

    local conf  = inifile.parse(config_file);
    local dns   = conf['internet']['dns'];
    local proto = conf['internet']['protocol'];
    local ip    = conf['internet']['ip'];
    local interface = conf['pppoe']['interface'];
    local id        = getMac(interface);
    
    local current_ip = socket.dns.toip(dns)
    if(current_ip)then
        if(current_ip ~= ip)then
            ip = current_ip; --update it
            conf['internet']['ip'] = ip;
            inifile.save(config_file, conf);
        end
    end
    local query = proto..'://'..ip..report_url;    
    local stat  = a_json:showStat();
    local j_stat= cjson.encode(stat);
    local sess  = a_json:showSessions();
    local j_sess= cjson.encode(sess);

    local curl_data= '{"report_type":"light","mac":"'..id..'","stat":'..j_stat..',"sessions":'..j_sess..'}';
    print(curl_data);
    os.remove(result_file)  
    os.execute('curl -k -o '..result_file..' -X POST -H "Content-Type: application/json" -d \''..curl_data..'\' '..query);
    afterReport();
end


function  getMac(interface)
	interface = interface or "eth0"
	io.input("/sys/class/net/" .. interface .. "/address")
	t = io.read("*line")
	dashes, count = string.gsub(t, ":", "-")
	dashes = string.upper(dashes)
	return dashes
end


if(report == 'light')then
    lightReport();
end



print("Doing the *"..report.."* report");


