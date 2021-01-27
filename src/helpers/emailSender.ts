import * as nodemailer from 'nodemailer';
import { User } from '../entity/User';

export const sendVerification = (user: User, code: string) => {
    let transporter = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    let mailOptions = {
        from: process.env.MAIL_USER,
        to: user.email,
        subject: 'DutyCalendar account verification',
        text: `Click on this link to verify your email ${process.env.SITE_URL}/verification?token=${code}&email=${user.email}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}