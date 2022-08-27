		<h3>
			<span style="font-family:arial,helvetica,sans-serif;">
                <span style="color:#696969;">Daily usage report</span>
            </span>
        </h3>
<!--
		<p>
			<span style="color:#696969;">
                <span style="font-family:arial,helvetica,sans-serif;">
                <span style="font-size:14px;">Here is the usage report
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
						<span style="color:#0066cc;"><strong><span style="font-family:arial,helvetica,sans-serif;">Percent of Data Cap Used</span></strong></span></td>
					<td>
						<span style="color:#696969;"><span style="font-family:arial,helvetica,sans-serif;"><?php echo $perc_data_used ?></span></span></td>
				</tr>

                <tr>
					<td>
						<span style="color:#0066cc;"><strong><span style="font-family:arial,helvetica,sans-serif;">Percent of Time Cap Used</span></strong></span></td>
					<td>
						<span style="color:#696969;"><span style="font-family:arial,helvetica,sans-serif;"><?php echo $perc_time_used ?></span></span></td>
				</tr>


			</tbody>
		</table>

        <p>
			<span style="color:#696969;">
                <span style="font-family:arial,helvetica,sans-serif;">Should you have any queries please contact help desk</span>
            </span>
        </p>

