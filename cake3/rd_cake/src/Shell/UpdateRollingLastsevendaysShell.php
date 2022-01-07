<?php

//Call this the following way from cron
// 25 * * * * www-data cd /var/www/radiusdesk/cake3/rd_cake && bin/cake update_rolling_lastsevendays >> /dev/null 2>&1
// Direct MySQL Call example:
//
// set @nms = 0;
// set @ins_err_cnt = 0;
// set @err_update_cnt  = 0;
// set @dead_seconds = 300;
// set @in_date_time = '2018-05-07 14:00:00'; 	-- replace with current date and just the hour component
// set @in_date = '2018-05-07'; 				-- replace with current date, no time component
// call sp_update_rolling_last_seven_days(@in_date_time,@in_date,@dead_seconds,@nms,@ins_err_cnt,@err_update_cnt);
// select @nms,@ins_err_cnt,@err_update_cnt;
//
namespace App\Shell;

use Cake\Console\Shell;
use Cake\Datasource\ConnectionManager;
use Cake\Core\Configure;
use Cake\Core\Configure\Engine\PhpConfig;

class UpdateRollingLastsevendaysShell extends Shell{
    public function main(){
        $this->out("Updating rolling last seven days");
		Configure::load('MESHdesk');
		$data 		= Configure::read('common_node_settings'); //Read the defaults
		$dead_after	= $data['heartbeat_dead_after'];
		$in_date_time = strftime('%F').' '.strftime('%H').':00:00';
		$in_date = strftime('%F');
        $this->connection = ConnectionManager::get('default');
        $this->connection->execute("set @dead_seconds = ".$dead_after);
        $this->connection->execute("set @nms = 0");
        $this->connection->execute("set @ins_err_cnt = 0");
        $this->connection->execute("set @err_update_cnt = 0");
        $this->connection->execute("set @in_date_time = '".$in_date_time."'");
        $this->connection->execute("set @in_date = '".$in_date."'");
        $this->connection->execute("call sp_update_rolling_last_seven_days(@in_date_time,@in_date,@dead_seconds,@nms,@ins_err_cnt,@err_update_cnt)");
        $results = $this->connection->execute("select @nms,@ins_err_cnt,@err_update_cnt;")->fetchAll('assoc');
        $count = $results[0]['@nms'];
		$insert_errs = $results[0]['@ins_err_cnt'];
		$update_errs = $results[0]['@err_update_cnt'];
        $this->out("$count nodes were updated with $insert_errs insert errors and $update_errs update errors.");
    } 
}

?>
