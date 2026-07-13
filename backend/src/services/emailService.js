const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporter = null;

const getTransporter = async () => {
	if (transporter) return transporter;

	if (env.email.host && env.email.user && env.email.pass) {
		transporter = nodemailer.createTransport({
			host: env.email.host,
			port: env.email.port,
			secure: env.email.port === 465,
			auth: { user: env.email.user, pass: env.email.pass },
			tls: { rejectUnauthorized: false },
		});
	} else {
		const testAccount = await nodemailer.createTestAccount();
		transporter = nodemailer.createTransport({
			host: "smtp.ethereal.email",
			port: 587,
			secure: false,
			auth: { user: testAccount.user, pass: testAccount.pass },
			tls: { rejectUnauthorized: false },
		});
		console.log("\x1b[36m%s\x1b[0m", `[EMAIL] Using Ethereal test account: ${testAccount.user}`);
	}

	return transporter;
};

const sendResetCode = async (to, code) => {
	try {
		const mail = await getTransporter();
		const info = await mail.sendMail({
			from: env.email.from,
			to,
			subject: "Your TaskFlow Password Reset Code",
			html: `
				<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
					<div style="text-align: center; margin-bottom: 28px;">
						<div style="font-size: 48px; margin-bottom: 8px;">📋</div>
						<h1 style="font-size: 24px; font-weight: 800; margin: 0; color: #1a1a2e;">TaskFlow</h1>
					</div>
					<div style="background: #f8f9ff; border-radius: 16px; padding: 28px 24px; border: 1px solid #e8e8f0;">
						<h2 style="font-size: 18px; margin: 0 0 8px; color: #1a1a2e;">Password Reset Code</h2>
						<p style="font-size: 14px; color: #666; margin: 0 0 20px; line-height: 1.5;">
							Use the code below to reset your password. It expires in 15 minutes.
						</p>
						<div style="background: #6c63ff; border-radius: 12px; padding: 16px; text-align: center;">
							<span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #fff;">${code}</span>
						</div>
						<p style="font-size: 12px; color: #999; margin: 20px 0 0; text-align: center;">
							If you didn't request this, you can safely ignore this email.
						</p>
					</div>
				</div>
			`,
		});

		if (info.messageId && env.email.host !== "smtp.ethereal.email") {
			console.log(`\x1b[32m%s\x1b[0m`, `[EMAIL] Reset code sent to ${to}`);
		} else {
			console.log(`\x1b[36m%s\x1b[0m`, `[EMAIL] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
		}

		return true;
	} catch (error) {
		console.error("\x1b[31m%s\x1b[0m", `[EMAIL] Failed to send: ${error.message}`);
		return false;
	}
};

module.exports = { sendResetCode };
