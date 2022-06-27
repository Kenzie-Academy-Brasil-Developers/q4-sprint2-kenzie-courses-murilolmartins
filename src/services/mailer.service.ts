import nodemailer from "nodemailer";
import path from "path";
import hbs from "nodemailer-express-handlebars";

const transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "e25c67019830cc",
    pass: "fc4e0d3df66173",
  },
});

const sendEmail = (name: string, course: string, duration: string) => {
  const handlebarOptions = {
    viewEngine: {
      defaultLayout: "email",
      partialsDir: path.resolve("./src/views/"),
    },
    viewPath: path.resolve("./src/views/"),
  };

  transport.use("compile", hbs(handlebarOptions));
  const mailOptions = {
    from: "murilo@mail.com", // Remetente
    to: "kenzie@mail.com", // Destinatário
    subject: "Testando Node Mailer", // Assunto
    template: "email",
    context: {
      name: name, // Substitui {{name}} por Aluno
      course: course, // Substitui {{company}} por Kenzie Academy
      duration: duration,
    },
  };

  transport.sendMail(mailOptions, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Email sent ");
    }
  });
};

export default sendEmail;
