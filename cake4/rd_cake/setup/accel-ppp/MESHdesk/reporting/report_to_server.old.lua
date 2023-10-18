#!/usr/bin/lua
-- Include libraries
package.path = "../libs/?.lua;./libs/?.lua;" .. package.path
require("rdNetwork");
require("rdSoftflowLogs");
require("rdConfig");
local utl           = require "luci.util";

--Some variables
local result_file   = '/tmp/result.json'
local gw_file       = '/tmp/gw'; 
local nfs           = require "nixio.fs";
local j             = require("luci.json");
local uci           = require("uci");
local x             = uci.cursor();
local sys           = require("luci.sys");
local util          = require("luci.util");
local network       = rdNetwork();
local config        = rdConfig();
local report        = 'light'; -- can be light or full

if(arg[1])then
    report = arg[1];
end

function file_exists(name)                                                          
        local f=io.open(name,"r")                                                   
        if f~=nil then io.close(f) return true else return false end                
end

function lightReport()
    local proto     = x:get("meshdesk", "reporting", "report_adv_proto");
    local url       = x:get("meshdesk", "internet1", "status_url");
    url             = url.."?_dc="..os.time(); 
    
    local server_tbl= config:getIpForHostname();
    local server    = server_tbl.hostname;
	if(server_tbl.fallback)then
	    server = server_tbl.ip;
	end
 
	local local_ip_v6   = network:getIpV6ForInterface('br-lan');
	if(local_ip_v6)then
	    server      = x:get("meshdesk", "internet1", "ip_6");
	    server      = '['..server..']';
	end
	
	local http_port     = x:get('meshdesk','internet1','http_port');
    local https_port    = x:get('meshdesk','internet1','https_port');
    local port_string   = '/';
    
    if(proto == 'http')then
        if(http_port ~= '80')then
            port_string = ":"..http_port.."/";
        end
    end
    
    if(proto == 'https')then
        if(https_port ~= '443')then
            port_string = ":"..https_port.."/";
        end
    end
	
    local query     = proto .. "://" .. server .. port_string .. url;
    print(query);
    
    local id_if = x:get('meshdesk','settings','id_if');
    local id    = network:getMac(id_if);
    local mode  = network:getMode();
    local curl_data= '{"report_type":"light","mac":"'..id..'","mode":"'..mode..'"}';
      
    --Check if softflows is implemented 
    local pid_sf = util.exec("pidof softflowd");
    local softflows_enabled = false;
    if(pid_sf ~= '')then
        softflows_enabled   = true;
        local s             = rdSoftflowLogs();
        local flows_table   = s:doDumpFlows();
        local flows_string  = j.encode(flows_table);
	    print("==FLOWS==");
	    print(flows_string);
	    print("==END FLOWS==");
        curl_data= '{"report_type":"light","mac":"'..id..'","mode":"'..mode..'","flows":'..flows_string..'}';
    end 
        
    --WBW--
    local wbw_dis   = x:get('meshdesk','web_by_wifi','disabled');
    if(wbw_dis == '0')then
        print("WBW Active find detail");
        local wbw_table     = fetchWbwInfo();
        local wbw_string    = j.encode(wbw_table);
        curl_data = '{"report_type":"light","mac":"'..id..'","mode":"'..mode..'","wbw_info":'..wbw_string..'}';
        if(softflows_enabled == true)then
            curl_data = '{"report_type":"light","mac":"'..id..'","mode":"'..mode..'","wbw_info":'..wbw_string..',"flows":'..flows_string..'}';
        end        
    end
    --END WBW--
    
    --QMI--
    local conf_file = x:get('meshdesk', 'settings','config_file');
    local f_conf    = nfs.access(conf_file);   
    if f_conf then      
        local contents  = nfs.readfile(conf_file);        
        local o         = j.decode(contents);
        if(o.success == true)then
            if(o.meta_data)then
                if(o.meta_data.QmiActive == true)then
                    local signal_info = util.exec("uqmi -d /dev/cdc-wdm0 --get-signal-info");
                    local system_info = util.exec("uqmi -d /dev/cdc-wdm0 --get-system-info");
                    curl_data = '{"report_type":"light","mac":"'..id..'","mode":"'..mode..'","qmi_info":{"signal" : '..signal_info..',"system":'..system_info..'}}';
                end
            end
        end
    end 
    --END QMI--
       
    --print(curl_data);
    os.remove(result_file)  
    os.execute('curl -k -o '..result_file..' -X POST -H "Content-Type: application/json" -d \''..curl_data..'\' '..query);
    afterReport();     
end

function fullReport()

    local gateway = 'none';
    local ts      = os.time();
   
     -- Netstats
    require("rdJsonReports");
    local json_r    = rdJsonReports();
    local n_stats   = '"network_info":'..json_r:runReport();
    
    require("rdSystemstats");
    local s         = rdSystemstats();
    local s_stats   = '"system_info":' .. s:getStats();
    
    -- Include Vis info --
    require('rdVis')
    local v 			= rdVis()
    local vis_string 	= "[]"
    local vis_feedback 	= v:getVis()
    if(vis_feedback)then
        vis_string = vis_feedback
    end
    -- END Vis Info -- 
    
    local id_if = x:get('meshdesk','settings','id_if');
    local id    = network:getMac(id_if);
    local mode  = network:getMode();
      
    local curl_data =   '{"report_type":"full","unix_timestamp":'..ts..',"mac":"'..id..'",'..n_stats..','..s_stats..',"vis":'..vis_string..',"gateway":"'..gateway..'","mode":"'..mode..'"}';
    
    local f   = nfs.access(gw_file);
    
    if f then  
        ----Include LAN INFO----
        local lan_info      = {};
        local s_lan_info    = '';
        require('ubus');
        local conn = ubus.connect();
        if conn then
            local namespaces = conn:objects()
            for i, n in ipairs(namespaces) do
                --LAN IPv4
                if(n == 'network.interface.lan')then
               --Swap the _4 out with .lan for NON Ipv6 - IPv6 still in development 
               -- if(n == 'network.interface.lan_4')then
               --     local info = conn:call("network.interface.lan_4", "status",{});
                    local info = conn:call("network.interface.lan", "status",{});
                    if(info['ipv4-address'] ~= nil)then
                        if(info['ipv4-address'][1]['address']~= '10.50.50.50')then --The Web-By-WiFi has a fixed IP if 10.50.50.50
                            gateway = 'lan';
                            if(info['up'] == true)then
                                lan_info['lan_proto'] = info['proto'];
                                if(info['ipv4-address'] ~= nil)then
                                    lan_info['lan_ip']= info['ipv4-address'][1]['address']
                                end
                                if(info['route'] ~= nil)then
                                    lan_info['lan_gw']= info['route'][1]['nexthop']
                                end
                                --Add The MAC
                                local uci   = require("uci");
                                
                                local id_if = x:get('meshdesk','settings','id_if');
                                local id    = network:getMac(id_if);
                                lan_info['mac'] = id;                   
                                s_lan_info = j.encode(lan_info);
                            end
                        end
                    end
                end
                
                --LAN IPv6
                if(n == 'network.interface.lan_6')then
                    local info = conn:call("network.interface.lan_6", "status",{});
                    if(info['ipv6-address'] ~= nil)then
                        if(info['ipv6-address'][1]['address']~= '10.50.50.50')then --The Web-By-WiFi has a fixed IP if 10.50.50.50
                            gateway = 'lan';
                            if(info['up'] == true)then
                                lan_info['lan_proto'] = info['proto'];
                                if(info['ipv6-address'] ~= nil)then
                                    lan_info['lan_ip']= info['ipv6-address'][1]['address']
                                end
                                if(info['route'] ~= nil)then
                                    lan_info['lan_gw']= info['route'][1]['nexthop']
                                end
                                --Add The MAC
                                local uci   = require("uci");
                                
                                local id_if = x:get('meshdesk','settings','id_if');
                                local id    = network:getMac(id_if);
                                lan_info['mac'] = id;                   
                                s_lan_info = j.encode(lan_info);
                            end
                        end
                    end
                end
                          
                --Web-By-Wifi (We had to shorten the name to web_by_w for pppoe
                if(n == 'network.interface.web_by_w')then
                    local info = conn:call("network.interface.web_by_w", "status",{});
                    gateway = 'wifi';
                    if(info['up'] == true)then
                        lan_info['lan_proto'] = info['proto'];
                        if(info['ipv4-address'] ~= nil)then
                            lan_info['lan_ip']= info['ipv4-address'][1]['address']
                        end
                        if(info['route'] ~= nil)then
                            lan_info['lan_gw']= info['route'][1]['nexthop']
                        end
                        --Add The MAC
                        local uci   = require("uci");    
                        local id_if = x:get('meshdesk','settings','id_if');
                        local id    = network:getMac(id_if);
                        lan_info['mac'] = id;                   
                        s_lan_info = j.encode(lan_info);
                    end
                end 
                
                --wwan
                if(n == 'network.interface.wwan_4')then
                    local info = conn:call("network.interface.wwan_4", "status",{});
                    gateway = '3g';
                    if(info['up'] == true)then
                        lan_info['lan_proto'] = info['proto'];
                        if(info['ipv4-address'] ~= nil)then
                            lan_info['lan_ip']= info['ipv4-address'][1]['address']
                        end
                        if(info['route'] ~= nil)then
                            lan_info['lan_gw']= info['route'][1]['nexthop']
                        end
                        --Add The MAC
                        local uci   = require("uci");    
                        local id_if = x:get('meshdesk','settings','id_if');
                        local id    = network:getMac(id_if);
                        lan_info['mac'] = id;                   
                        s_lan_info = j.encode(lan_info);
                    end
                end 
                                  
            end
        end
        --END LAN INFO--	    
        curl_data= '{"report_type":"full","unix_timestamp":'..ts..',"mac":"'..id..'",'..n_stats..','..s_stats..','..'"lan_info":'..s_lan_info..',"vis":'..vis_string..',"gateway":"'..gateway..'","mode":"'..mode..'"}';
    end

    local proto     = x:get("meshdesk", "reporting", "report_adv_proto");
    local mode      = x:get("meshdesk", "internet1", "mode");
    local url       = x:get("meshdesk", "internet1", "status_url");
    url             = url.."?_dc="..os.time();
    
    local server_tbl= config:getIpForHostname();
    local server    = server_tbl.hostname;
	if(server_tbl.fallback)then
	    server = server_tbl.ip;
	end

	local local_ip_v6   = network:getIpV6ForInterface('br-lan');
	if(local_ip_v6)then
	    server      = x:get("meshdesk", "internet1", "ip_6");
	    server      = '['..server..']';
	end
	
	local http_port     = x:get('meshdesk','internet1','http_port');
    local https_port    = x:get('meshdesk','internet1','https_port');
    local port_string   = '/';
    
    if(proto == 'http')then
        if(http_port ~= '80')then
            port_string = ":"..http_port.."/";
        end
    end
    
    if(proto == 'https')then
        if(https_port ~= '443')then
            port_string = ":"..https_port.."/";
        end
    end
	
    local query     = proto .. "://" .. server .. port_string .. url;
    print(query);
    --print(curl_data);
    os.remove(result_file)
    os.execute('curl -k -o '..result_file..' -X POST -H "Content-Type: application/json" -d \''..curl_data..'\' '..query) 
    afterReport(true);

end

function afterReport(clear_flag)

    clear_flag = clear_flag or false; --If Clear flag is set we need to purge the stations table
    local ok_flag = false;
    --Read the results
    local f=io.open(result_file,"r")
    if(f)then
        result_string = f:read("*all")
        r =j.decode(result_string);
        if(r.success)then
            ok_flag = true;
            --Purge the DB tables
            if(clear_flag)then
                local json_r  = rdJsonReports()
                json_r:purgeJson();
            end
        
            --Reboot check  
            if(r.reboot_flag ~= nil)then
                if(r.reboot_flag == true)then --Only if it is set to true
                    os.execute("reboot");
                end
            end
            --Commands to execute
            for index, value in pairs(r.items) do
                os.execute('touch /etc/MESHdesk/mesh_status/waiting/'..value)    
            end
            
            --Also check if there were changes to the intervals and adjust accordingly
            checkReporting(r);            
        end                            
    end
    if(ok_flag)then
        internetLED('1'); -- NOTE Here we can swap thme around eg make it 0 to turn off a red LED when the internet is OK
        checkForContollerReboot('1');
    else
        internetLED('0');
        checkForContollerReboot('0');    
    end
end


function checkReporting(r)

    if(r.reporting ~= nil)then
        local srvr_proto    = r.reporting.report_adv_proto;
        local srvr_light    = tonumber(r.reporting.report_adv_light);
        local srvr_full     = tonumber(r.reporting.report_adv_full);
        local srvr_sampl    = tonumber(r.reporting.report_adv_sampling);
        
        local unit_proto    = x:get("meshdesk", "reporting", "report_adv_proto");
        local unit_light    = tonumber(x:get("meshdesk", "reporting", "report_adv_light"));
        local unit_full     = tonumber(x:get("meshdesk", "reporting", "report_adv_full"));
        local unit_sampl    = tonumber(x:get("meshdesk", "reporting", "report_adv_sampling"));
        
        local changed       = false;
         
        if(unit_proto ~= srvr_proto)then
            x:set('meshdesk', 'reporting', 'report_adv_proto',srvr_proto);
            changed = true;
        end
        
        if(unit_light ~= srvr_light)then
            x:set('meshdesk', 'reporting', 'report_adv_light',srvr_light);
            changed = true;
        end
        
        if(unit_full ~= srvr_full)then
            x:set('meshdesk', 'reporting', 'report_adv_full',srvr_full);
            changed = true;
        end
        
        if(unit_sampl ~= srvr_sampl)then
            x:set('meshdesk', 'reporting', 'report_adv_sampling',srvr_sampl);
            changed = true;
        end

        if(changed)then
            x:commit('meshdesk');
            --create a flag file to force the heartbeat file to reload its values
            utl.exec("touch /tmp/reporting_changed.txt");
        end
        
    end
end

function internetLED(state)
    local hardware  = x:get('meshdesk', 'settings', 'hardware');
    local led       = x:get('meshdesk', hardware, 'internet_led');
    os.execute('echo '..state..' > ' .. led );
end

function fetchWbwInfo()
    local wbw_info  = {};
    local iw        = sys.wifi.getiwinfo('wbw');
    if(iw.channel ~= nil)then
        wbw_info['channel']     = iw.channel;
        wbw_info['signal']      = iw.signal;
        wbw_info['txpower']     = iw.txpower;
        wbw_info['noise']       = iw.noise; 
        wbw_info['bitrate']     = iw.bitrate; 
        wbw_info['quality']     = iw.quality;
        wbw_info['ssid']        = iw.ssid;
        local sta_list          = iw.assoclist;      
        local throughput        = 0;
        local tx_rate           = 0;
        local rx_rate           = 0;
        local tx_packets        = 0;
        local rx_packets        = 0;

        for key,value in pairs(sta_list) do 
            throughput = sta_list[key]['expected_throughput'];
            tx_rate    = sta_list[key]['tx_rate'];
            rx_rate    = sta_list[key]['rx_rate'];
            tx_packets = sta_list[key]['tx_packets'];
            rx_packets = sta_list[key]['rx_packets'];
        end
        wbw_info['expected_throughput']     = throughput;
        wbw_info['tx_rate']                 = tx_rate;
        wbw_info['rx_rate']                 = rx_rate;
        wbw_info['tx_packets']              = tx_packets;
        wbw_info['rx_packets']              = rx_packets;             
    end
    return wbw_info;
end


function checkForContollerReboot(state)

	local cnt_missing_file 	= "/tmp/cnt_missing_stamp";
	
	if(state == '1')then
	    local mf =io.open(cnt_missing_file,"r");
	    if(mf ~=nil) then
	        os.remove(gw_missing_file)   
	    end
	    return;
	end
	
	--Do this for state == '0' // implicit
	local uci 		        = require('uci')
	local x	  		        = uci.cursor()
	local cnt_auto_reboot 	= x:get('meshdesk', 'settings', 'cnt_auto_reboot')
	local reboot_time	    = x:get('meshdesk', 'settings', 'cnt_auto_reboot_time')
	
	if(cnt_auto_reboot == '1')then
	    --Check if it is the first time the controller is missing
	    local mf =io.open(cnt_missing_file,"r")
	    if mf==nil then
		    print("Create new controller missing file")
		    --Write the current timestamp to the file
		    local ts = os.time()
		    --Write this to the config file
		    local f,err = io.open(cnt_missing_file,"w")
		    if not f then return print(err) end
		    f:write(ts)
		    f:close()
	    else
		    print("Existing missing file... check timestamp")
		    local ts_last = mf:read()
		    print("The last failure was at "..ts_last)
		    if(ts_last+reboot_time < os.time())then
			    print("We need to reboot")
			    os.execute("reboot")
		    end
		    mf:close()
	    end
    end
end


if(report == 'light')then
    lightReport();
end

if(report == 'full')then
    fullReport();
end

print("Doing the "..report.." report");


