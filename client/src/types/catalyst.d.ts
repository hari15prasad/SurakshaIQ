/**
 * Zoho Catalyst Web SDK v4 — Ambient Type Declarations
 *
 * The `catalyst` global is injected by the SDK scripts loaded in index.html:
 *   - catalystWebSDK.js  (SDK core)
 *   - /__catalyst/sdk/init.js  (project-specific initialisation)
 *
 * These declarations describe the subset of the SDK surface used by SurakshaIQ.
 * Source: https://docs.catalyst.zoho.com/en/sdk/web/
 */

interface CatalystRoleDetails {
  readonly role_id: string;
  readonly role_name: string;
}

interface CatalystUser {
  readonly user_id: string;
  readonly email_id: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly zuid: string;
  readonly org_id: string;
  readonly status: string;
  readonly time_zone: string;
  readonly locale: string;
  readonly role_details: CatalystRoleDetails;
}

interface CatalystAuthResponse {
  readonly content: CatalystUser;
}

interface CatalystSignInConfig {
  readonly css_url?: string;
  readonly service_url?: string;
  readonly is_customize_forgot_password?: boolean;
  readonly forgot_password_id?: string;
  readonly forgot_password_css_url?: string;
  readonly signin_providers_only?: boolean;
}

interface CatalystAuth {
  signIn(elementId: string, config?: CatalystSignInConfig): void;
  signOut(redirectURL: string): void;
  isUserAuthenticated(): Promise<CatalystAuthResponse>;
}

interface CatalystSDK {
  readonly auth: CatalystAuth;
}

declare const catalyst: CatalystSDK;
