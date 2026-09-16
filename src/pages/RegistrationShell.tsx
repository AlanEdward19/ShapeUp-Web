import Register from './Register';
import publicCss from './public-auth/publicUsability.css?inline';
import PublicShellHost from './public-auth/PublicShellHost';
import {
  RegisterPublicMarkup,
  type RegisterShellState,
} from './public-auth/markup/RegisterPublicMarkup';
import {
  InvitationPublicMarkup,
  type InvitationShellState,
} from './public-auth/markup/InvitationPublicMarkup';

const registerRoleCss =
  '.role-option:has(input:checked){border-color:#e06c43;background:rgba(224,108,67,.06)}.role-option:has(input:checked) .role-dot{display:block}.role-option:has(input:checked) .role-radio{border-color:#e06c43}';

export default function RegistrationShell() {
  return (
    <Register
      renderView={(state: Record<string, unknown>) => {
        const invited = Boolean(state.inviteToken);
        return (
          <PublicShellHost
            name={invited ? 'invitation' : 'register'}
            css={invited ? publicCss : `${publicCss}${registerRoleCss}`}
          >
            {invited ? (
              <InvitationPublicMarkup state={state as unknown as InvitationShellState} />
            ) : (
              <RegisterPublicMarkup state={state as unknown as RegisterShellState} />
            )}
          </PublicShellHost>
        );
      }}
    />
  );
}
