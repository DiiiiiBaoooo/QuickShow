import nodemailer from 'nodemailer'
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, 
    auth: {
     user: "8fbbbe002@smtp-brevo.com",
     pass: "xsmtpsib-6ad4ec487c30e2ea29eaecdf15f996d6ee1f1c841dac97319fd5deed30afc72d-TzZUrnqf854aLHvO",
    },
  });
  const sendEmail = async ({to,subject,body}) =>{
            const response = await transporter.sendMail({
                from: "user.greatestack@gmail.com",
                to,
                subject,
                html:body,
            })
            return response
  }
  export default sendEmail;