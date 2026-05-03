import * as v from 'valibot';

const SameSiteSchema = v.picklist(['no_restriction', 'lax', 'strict', 'unspecified']);

/** Chrome cookie shape, validated. Used for IPC payloads and JSON imports. */
export const CookieSchema = v.object({
  name: v.string(),
  value: v.string(),
  domain: v.string(),
  path: v.string(),
  secure: v.boolean(),
  httpOnly: v.boolean(),
  hostOnly: v.boolean(),
  session: v.boolean(),
  expirationDate: v.optional(v.number()),
  sameSite: SameSiteSchema,
  storeId: v.string(),
});

export type ValidatedCookie = v.InferOutput<typeof CookieSchema>;

/** Form-submitted partial cookie. All fields optional; unknown fields stripped. */
export const CookieFormInputSchema = v.partial(
  v.object({
    name: v.string(),
    value: v.string(),
    domain: v.string(),
    path: v.string(),
    secure: v.boolean(),
    httpOnly: v.boolean(),
    hostOnly: v.boolean(),
    session: v.boolean(),
    expirationDate: v.number(),
    sameSite: SameSiteSchema,
    storeId: v.string(),
  }),
);

export type ValidatedCookieFormInput = v.InferOutput<typeof CookieFormInputSchema>;

/** Update payload sent over IPC. `previousAttributes` may carry a UI-only `id`. */
export const UpdatePayloadSchema = v.object({
  previousAttributes: v.intersect([
    CookieSchema,
    v.object({ id: v.optional(v.number()) }),
  ]),
  changedAttributes: CookieFormInputSchema,
});

export type ValidatedUpdatePayload = v.InferOutput<typeof UpdatePayloadSchema>;

/** Import file: array of cookies, each may have a UI-only `id` that we drop. */
export const CookieImportSchema = v.array(
  v.intersect([CookieSchema, v.object({ id: v.optional(v.number()) })]),
);

/**
 * Permissive schema for cookies *received* from the background. Chrome's cookie
 * objects sometimes omit fields like `expirationDate`; we let unknown fields
 * through but coerce the shape so the panel can trust required keys.
 */
export const IncomingCookieSchema = v.looseObject({
  name: v.string(),
  value: v.string(),
  domain: v.string(),
  path: v.string(),
  secure: v.boolean(),
  httpOnly: v.boolean(),
  hostOnly: v.boolean(),
  session: v.boolean(),
  expirationDate: v.optional(v.number()),
  sameSite: SameSiteSchema,
  storeId: v.string(),
});

export const IncomingCookieListSchema = v.object({
  cookies: v.array(IncomingCookieSchema),
});

export type IncomingCookie = v.InferOutput<typeof IncomingCookieSchema>;
