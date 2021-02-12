import * as mailgun from 'mailgun-js';
import { User } from '../entity/User';
const mg = mailgun({
    apiKey: process.env.MAIL_API_KEY,
    domain: process.env.MAIL_API_DOMAIN,
    host: "api.eu.mailgun.net"
});

export const sendVerification = (user: User, code: string) => {
    const data = {
        from: `noreply@dutycalendar.ninja`,
        to: user.email,
        subject: 'Email verification',
        text: `Click on this link to verify your email ${process.env.SITE_URL}/verification/${code}/${user.id}`,
        template: 'verification',
        "h:X-Mailgun-Variables": `{"action_url": "${process.env.SITE_URL}/verification/${code}/${user.id}"}`
    };

    mg.messages().send(data, (error, body) => {
        console.log(error, body);
    });
};