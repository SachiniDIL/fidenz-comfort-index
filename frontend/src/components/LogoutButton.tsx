import { useAuth0 } from '@auth0/auth0-react';

export function LogoutButton() {
  const { logout } = useAuth0();

  return (
    <button
      type="button"
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
      className="inline-flex items-center justify-center rounded border border-hairline bg-surface px-3 py-2 font-mono text-xs font-medium uppercase tracking-wider text-ink transition-colors hover:border-slate"
    >
      Log out
    </button>
  );
}
