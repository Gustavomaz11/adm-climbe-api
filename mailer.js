import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendApprovalEmail(to, name) {
  await transporter.sendMail({
    from: `"Climbe Team" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Sua solicitação foi aprovada!',
    html: `<p>Olá <strong>${name}</strong>,<br/>Sua solicitação foi aprovada! Você já pode acessar o sistema.</p>`,
  })
}

export async function sendRejectionEmail(to, name) {
  await transporter.sendMail({
    from: `"Climbe Team" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Solicitação Reprovada',
    html: `<p>Olá <strong>${name}</strong>,<br/>Infelizmente sua solicitação foi reprovada. Entre em contato para mais detalhes.</p>`,
  })
}
