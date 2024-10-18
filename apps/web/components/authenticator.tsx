import {
  FetchUserAttributesOutput,
  fetchUserAttributes,
  getCurrentUser,
  signOut,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { Spinner } from "./ui/spinner";
import Image from "next/image";
import logo from "@/assets/logo.png";

type AuthenticatorContextType = {
  userAttributes: FetchUserAttributesOutput | null;
  loading: boolean;
  error: Error | null;
  signOut: () => void;
};

const AuthenticatorContext = createContext<AuthenticatorContextType>({
  userAttributes: null,
  loading: false,
  error: null,
  signOut: () => {},
});

export const AuthenticatorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [userAttributes, setUserAttributes] =
    useState<FetchUserAttributesOutput | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const attributes = await fetchUserAttributes();
        setUserAttributes(attributes);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    Hub.listen("auth", ({ payload }) => {
      if (payload.event === "signedIn") {
        loadUser();
      }
    });

    loadUser();
  }, []);

  function handleSignOut() {
    setLoading(true);
    signOut().then(() => {
      window.location.href = `/sign-in?next=${pathname}`;
    });
  }

  if (loading) {
    return (
      <main className="w-full h-full min-h-screen flex flex-col gap-12 items-center justify-center">
        <Image
          src={logo}
          alt="Logo"
          className="-mt-16"
          width={36}
          height={36}
        />
        <div className="relative flex items-center justify-center">
          <Spinner className="text-[28px] text-foreground" />
        </div>
      </main>
    );
  }

  return (
    <AuthenticatorContext.Provider
      value={{
        loading,
        userAttributes,
        error: null,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthenticatorContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthenticatorContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthenticatorProvider");
  }

  return context;
};
