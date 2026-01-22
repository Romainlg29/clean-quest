import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { sign_in_schema } from "@api/schemas/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useSignIn } from "@/hooks/use-sign-in";

const SignIn = () => {
  const { mutateAsync: signIn } = useSignIn();

  // Navigation
  const navigate = useNavigate();

  // Form handler
  const form = useForm({
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
    validators: {
      onSubmit: sign_in_schema,
    },
    onSubmit: async ({ value }) => {
      await signIn(value, {
        onSuccess: () => {
          toast.success("Connexion réussie !");
          navigate({ to: "/home" });
        },
        onError: () => {
          toast.error("Échec de la connexion. Veuillez réessayer.");
        },
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>
          Connectez-vous à votre compte pour continuer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="sign-in"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="usernameOrEmail"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Nom d'utilisateur ou adresse e-mail
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Votre nom d'utilisateur ou adresse e-mail"
                      autoComplete="username"
                    />

                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            />

            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Mot de passe</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="Votre mot de passe"
                      type="password"
                      autoComplete="current-password"
                    />

                    {isInvalid ? (
                      <FieldError errors={field.state.meta.errors} />
                    ) : null}
                  </Field>
                );
              }}
            />
          </FieldGroup>

          <Button type="submit" className="w-full mt-4">
            Se connecter
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignIn;
