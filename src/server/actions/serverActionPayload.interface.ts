export interface ServerActionPayloadInterface {
  message?: string;
  success?: boolean;
  /** Id of the created/updated changelog, when applicable. */
  id?: string;
  /** Per-field validation errors keyed by form field name. */
  fieldErrors?: Record<string, string>;
}
