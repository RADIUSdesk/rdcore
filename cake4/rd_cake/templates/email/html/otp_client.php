<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5f7fa;padding:40px 20px;font-family:Arial,Helvetica,sans-serif;">
    <tr>
        <td align="center">

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="500" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;">
                <tr>
                    <td style="padding:30px;">

                        <h2 style="margin:0 0 20px;color:#1f2937;font-size:24px;font-weight:600;">
                            <?= __('Client Registration OTP') ?>
                        </h2>

                        <p style="margin:0 0 25px;color:#6b7280;font-size:15px;line-height:22px;">
                            <?= __('Use the OTP below to complete your registration.') ?>
                        </p>

                        <table role="presentation" width="100%" cellpadding="12" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
                            <tr>
                                <td style="background:#f9fafb;border-bottom:1px solid #e5e7eb;font-weight:bold;color:#374151;width:35%;">
                                    <?= __('Username') ?>
                                </td>
                                <td style="border-bottom:1px solid #e5e7eb;color:#4b5563;">
                                    <?= h($username) ?>
                                </td>
                            </tr>

                            <tr>
                                <td style="background:#f9fafb;border-bottom:1px solid #e5e7eb;font-weight:bold;color:#374151;">
                                    <?= __('OTP') ?>
                                </td>
                                <td style="border-bottom:1px solid #e5e7eb;color:#2563eb;font-size:20px;font-weight:bold;letter-spacing:3px;">
                                    <?= h($otp) ?>
                                </td>
                            </tr>
                        </table>

                        <div style="text-align:center;margin:35px 0;">
                            <a href="<?= h($url) ?>"
                               style="background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;display:inline-block;">
                                <?= __('Confirm OTP') ?>
                            </a>
                        </div>

                        <p style="margin:25px 0 0;color:#6b7280;font-size:13px;line-height:20px;">
                            <?= __('If the button above does not work, copy and paste the following link into your browser:') ?>
                        </p>

                        <p style="margin:10px 0 0;word-break:break-all;">
                            <a href="<?= h($url) ?>" style="color:#2563eb;">
                                <?= h($url) ?>
                            </a>
                        </p>

                    </td>
                </tr>
            </table>

        </td>
    </tr>
</table>


