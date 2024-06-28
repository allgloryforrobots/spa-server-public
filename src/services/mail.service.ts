import nodemailer, {Transporter} from "nodemailer"
import SMTPTransport from "nodemailer/lib/smtp-transport"

class MailService {
    transporter: Transporter

    constructor() {

        const transportOptions: SMTPTransport.Options = {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 0,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        }

        this.transporter = nodemailer.createTransport(transportOptions)
    }

    public async sendActivationEmail(to: string, link: string): Promise<void> {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to: to,
            subject: 'Активация аккаунта на ' + link,
            text: '',
            html:
                `
                <div>
                    <h1>Для активации перейдите по ссылке</h1>
                    <a href="${link}">${link}</a>
                </div>
                `
        })
    }

}

const mailService = new MailService()
export default mailService
