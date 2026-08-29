import { useAuth0 } from '@auth0/auth0-react';

export function LogoutButton() {
  const { logout } = useAuth0();

  return (
    <button
      type="button"
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
    >
      Log out
    </button>
  );
}
