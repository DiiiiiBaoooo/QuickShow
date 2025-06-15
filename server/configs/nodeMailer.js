import nodemailer from 'nodemailer'
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "duybao11123@gmail.com",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
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