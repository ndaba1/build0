import {
  AuthSession,
  FetchUserAttributesOutput,
  fetchAuthSession,
  fetchUserAttributes,
  signOut,
} from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { Loader } from "./loader";

type AuthenticatorContextType = {
  idToken?: string | null;
  accessToken?: string | null;
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
  accessToken: null,
  idToken: null,
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
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const [session, attributes] = await Promise.all([
          fetchAuthSession(),
          fetchUserAttributes(),
        ]);

        setUserAttributes(attributes);
        setAuthSession(session);
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
    return <Loader />;
  }

  const tokens = authSession?.tokens;
  const idToken = tokens?.idToken?.toString();
  const accessToken = tokens?.accessToken?.toString();

  return (
    <AuthenticatorContext.Provider
      value={{
        idToken,
        accessToken,
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
