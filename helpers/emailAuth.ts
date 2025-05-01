import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { User } from "../models/User.ts";
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

export const emailRegister = async (dataUser:User) => {
  const env = await load();
  const client = new SMTPClient({
    connection: {
      hostname: env.EM_HOST,
      port: Number(env.EM_PORT),
      tls: true,
      auth: {
        username: env.EM_USERNAME,
        password:
          env.EM_PASSWORD,
      },
    },
  });

  const {email, name, token} = dataUser;
  console.log(dataUser);

  await client.send({
    from: "marcosugaldemo@gmail.com",
    to: email,
    subject: "Comprueba tu cuenta en MyComponents",
    html: `<p>Hola: ${name}, comprueba tu cuenta en MyComponents.</p><p>Tu cuenta ya esta lista, solo debes comprobarlar em el siguiente enlace: <a href="http://localhost:8000/api/user/verify/${token}">Comprobar cuenta</a></p><p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>`,
  });
  console.log(`Authentication mail send to: ${email}`);
  await client.close();
};
