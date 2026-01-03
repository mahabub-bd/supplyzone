import SignInForm from "../../components/auth/SignInForm";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | Smart Sale POS"
        description="Login to Smart Sale POS to manage sales, inventory, billing, and reports."
      />

      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
