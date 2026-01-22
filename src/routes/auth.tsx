import SignIn from "@/components/domain/auth/sign-in";
import SignUp from "@/components/domain/auth/sign-up";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { createFileRoute, redirect } from "@tanstack/react-router";

const Index = () => {
  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <Tabs className="w-full md:w-1/2" defaultValue="sign-up">
        <TabsList>
          <TabsTrigger value="sign-in">Connexion</TabsTrigger>
          <TabsTrigger value="sign-up">Inscription</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-in">
          <SignIn />
        </TabsContent>
        <TabsContent value="sign-up">
          <SignUp />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export const Route = createFileRoute("/auth")({
  component: Index,
  beforeLoad: async () => {
    // Validate if the user is already authenticated
    const response = await api.v1.auth.verify.post();

    // If authenticated, redirect to home
    if (response.status === 200) {
      throw redirect({ to: "/" });
    }
  },
});
