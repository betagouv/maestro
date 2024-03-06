import { z } from 'zod';

export const SignIn = z.object({
  email: z
    .string({ required_error: 'Veuillez renseigner votre adresse email.' })
    .email("L'adresse doit être un email valide"),
  password: z
    .string({ required_error: 'Veuillez renseigner votre mot de passe.' })
    .min(8, 'Au moins 8 caractères.')
    .regex(/[A-Z]/g, 'Au moins une majuscule.')
    .regex(/[a-z]/g, 'Au moins une minuscule.')
    .regex(/[0-9]/g, 'Au moins un chiffre.'),
});

export const SignInBody = z.object({
  body: SignIn,
});

export type SignIn = z.infer<typeof SignIn>;
