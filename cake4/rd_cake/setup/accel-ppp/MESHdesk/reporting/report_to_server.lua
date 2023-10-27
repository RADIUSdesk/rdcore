#!/usr/bin/lua
-- Include libraries
package.path = "../libs/?.lua;./libs/?.lua;" .. package.path
require('rdAccelJson');
require('rdLogger');

local result_file   = '/tmp/result.json'
local a_json        = rdAccelJson();
local logger        = rdLogger();
local cjson         = require("cjson");
local report        = 'light'; -- can be light or full

if(arg[1])then
    report = arg[1];
end

function file_exists(name)                                                          
        local f=io.open(name,"r")                                                   
        if f~=nil then io.close(f) return true else return false end                
end

function afterReport()
    local ok_flag = false;
    --Read the results
    local f=io.open(result_file,"r")
    if(f)then
        result_string = f:read("*all")
        print(result_string);
        r = cjson.decode(result_string);
        if(r.success)then
            ok_flag = true;       
        end                            
    end
end

function lightReport()
    local id    = 'aa-bb-cc-dd-ee-ff';
    local mode  = 'standalone';
    local query = 'http://127.0.0.1/cake4/rd_cake/accel-servers/submit-report.json';
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

if(report == 'light')then
    lightReport();
end

if(report == 'full')then
    --fullReport();
end

print("Doing the *"..report.."* report");


