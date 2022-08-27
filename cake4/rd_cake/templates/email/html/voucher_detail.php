		<h3>
			<span style="font-family:arial,helvetica,sans-serif;">
                <span style="color:#696969;">Voucher Detail</span>
            </span>
        </h3>
<!--
		<p>
			<span style="color:#696969;">
                <span style="font-family:arial,helvetica,sans-serif;">
                <span style="font-size:14px;">Here is the voucher detail
                </span></span>
            </span>
        </p>
-->
		<table cellpadding="5" cellspacing="1" style="width: 300px;">
			<tbody>
				<tr>
					<td>
						<span style="color:#0066cc;"><strong><span style="font-family:arial,helvetica,sans-serif;">Username</span></strong></span></td>
					<td>
						<span style="color:#696969;"><span style="font-family:arial,helvetica,sans-serif;"><?php echo $username ?></span></span></td>
				</tr>
				<tr bgcolor="#eef3f3">
					<td>
						<span style="color:#0066cc;"><strong><span style="font-family:arial,helvetica,sans-serif;">Password</span></strong></span></td>
					<td>
						<span style="color:#696969;"><span style="font-family:arial,helvetica,sans-serif;"><?php echo $password ?></span></span></td>
				</tr>
<?php
    $stripe = false;
    if($profile){
        if($stripe){
            print('<tr bgcolor="#eef3f3">');
        }else{
            print('<tr>');
        }
		print('<td>');
	    print('<span style="color:#0066cc;"><strong><span style="font-family:arial,helvetica,sans-serif;"></span>Profile</strong></span></td>');
		print('<td>');
		print('<span style="color:#696969;"><span style="font-family:arial,helvetica,sans-serif;">'.$profile.'</span></span></td>');
		print('</tr>');
        $stripe = !($stripe);
    }

    if($valid_for){
        if($stripe){
            print('<tr bgcolor="#eef3f3">');
        }else{
            print('<tr>');
        }
		print('<td>');
	    print('<span style="color:#0066cc;"><strong><span style="font-family:arial,helvetica,sans-serif;"></span>Valid for</strong></span></td>');
		print('<td>');
		print('<span style="color:#696969;"><span style="font-family:arial,helvetica,sans-serif;">'.$valid_for.'</span></span></td>');
		print('</tr>');
        $stripe = !($stripe);
    }

    if($extra_value != ''){

        if($stripe){
            print('<tr bgcolor="#eef3f3">');
        }else{
            print('<tr>');
        }
		print('<td>');
	    print('<span style="color:#0066cc;"><strong><span style="font-family:arial,helvetica,sans-serif;"></span>'.$extra_name.'</strong></span></td>');
		print('<td>');
		print('<span style="color:#696969;"><span style="font-family:arial,helvetica,sans-serif;"></span>'.$extra_value.'</span></td>');
		print('</tr>');
        $stripe = !($stripe);
    }
?>

			</tbody>
		</table>
<?php
    if($message != ''){	
        print('<div style="color:#696969; border-style:solid; border-color:#767c7c; border-width:1px; padding: 10px; margin: 2px; margin-top: 10px; width:300px">');
        print($message);
        print('</div>');
    }
?>
        <p>
			<span style="color:#696969;">
                <span style="font-family:arial,helvetica,sans-serif;">Should you have any queries please contact help desk</span>
            </span>
        </p>

