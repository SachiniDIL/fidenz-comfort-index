import { useAuth0 } from '@auth0/auth0-react';

export function LoginButton() {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      type="button"
      onClick={() => loginWithRedirect()}
      className="inline-flex w-full items-center justify-center rounded bg-ink px-5 py-3 font-mono text-xs font-medium uppercase tracking-wider text-surface transition-colors hover:bg-slate"
    >
      Log in
    </button>
  );
}
