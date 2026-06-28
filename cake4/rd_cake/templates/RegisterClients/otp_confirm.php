<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">

    <title>OTP Confirmed</title>
</head>

<body style="
    margin:0;
    padding:40px;
    background:#f1f5f9;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
">

<div style="
    max-width:720px;
    margin:0 auto;
    background:#ffffff;
    border-radius:12px;
    overflow:hidden;
    box-shadow:0 4px 20px rgba(0,0,0,0.08);
">

    <!-- Header -->
    <div style="
        background:#10b981;
        padding:28px 32px;
    ">

        <div style="
            color:#ffffff;
            font-size:28px;
            font-weight:700;
            margin-bottom:8px;
        ">
            ✓ OTP Confirmed
        </div>

        <div style="
            color:#d1fae5;
            font-size:15px;
        ">
            The OTP has been successfully confirmed.
        </div>

    </div>

    <!-- Content -->
    <div style="padding:32px;">

        <!-- Details Table -->
        <table cellpadding="0" cellspacing="0" style="
            width:100%;
            border-collapse:collapse;
            border:1px solid #e2e8f0;
            border-radius:8px;
            overflow:hidden;
        ">

            <tr bgcolor="#f8fafc">
                <td style="
                    padding:14px 18px;
                    font-weight:600;
                    color:#475569;
                    border-bottom:1px solid #e2e8f0;
                ">
                    Username
                </td>

                <td style="
                    padding:14px 18px;
                    color:#1e293b;
                    border-bottom:1px solid #e2e8f0;
                ">
                    <?= htmlspecialchars($data->client->username) ?>
                </td>
            </tr>

            <tr>
                <td style="
                    padding:14px 18px;
                    font-weight:600;
                    color:#475569;
                    border-bottom:1px solid #e2e8f0;
                ">
                    OTP
                </td>

                <td style="
                    padding:14px 18px;
                    color:#1e293b;
                    border-bottom:1px solid #e2e8f0;
                ">
                    <?= htmlspecialchars($data->value) ?>
                </td>
            </tr>

        </table>

        <!-- Footer -->
        <div style="
            margin-top:28px;
            font-size:13px;
            color:#64748b;
            line-height:1.6;
        ">
            Your registration process is now complete and you can log in with your username and password.
        </div>

    </div>

</div>

</body>
</html>
