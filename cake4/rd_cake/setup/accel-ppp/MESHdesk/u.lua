#!/usr/bin/lua
--[[--
Startup script to get the config of the device from the config server
--]]--

-- Include libraries
package.path = "libs/?.lua;" .. package.path;

local http  = require("socket.http");
local cjson = require("cjson");
local requesrString = "http://127.0.0.1/cake4/rd_cake/nodes/get-config-for-node.json?gateway=true&_dc=1651070922&version=22.03&mac=64-64-4A-D1-2D-67";
local body, code = http.request(requesrString);
local jsonDict = cjson.decode(body);