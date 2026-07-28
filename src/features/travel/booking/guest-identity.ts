export type GuestIdType = "passport" | "national-id" | "drivers-license";

export type GuestIdentity = {
  idType: GuestIdType | "";
  idNumber: string;
  expiryDate: string;
  confirmed: boolean;
};

export type GuestIdentityField = keyof GuestIdentity;

export type GuestIdentityErrors = Partial<
  Record<GuestIdentityField, string>
>;

export function createEmptyGuestIdentity(): GuestIdentity {
  return {
    idType: "",
    idNumber: "",
    expiryDate: "",
    confirmed: false,
  };
}

export function validateGuestIdentity(
  identity: GuestIdentity,
): { isValid: boolean; errors: GuestIdentityErrors } {
  const errors: GuestIdentityErrors = {};

  if (!identity.idType) {
    errors.idType = "booking.guest.idTypeRequired";
  }

  const trimmedNumber = identity.idNumber.trim();

  if (!trimmedNumber || trimmedNumber.length < 5) {
    errors.idNumber = "booking.guest.idNumberInvalid";
  }

  if (!identity.expiryDate) {
    errors.expiryDate = "booking.guest.idExpiryRequired";
  } else {
    const expiry = new Date(identity.expiryDate);
    const minimumValidUntil = new Date();
    minimumValidUntil.setMonth(minimumValidUntil.getMonth() + 6);

    if (Number.isNaN(expiry.getTime()) || expiry < minimumValidUntil) {
      errors.expiryDate = "booking.guest.idExpiryInvalid";
    }
  }

  if (!identity.confirmed) {
    errors.confirmed = "booking.guest.idConfirmRequired";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateGuestIdentities(
  identities: GuestIdentity[],
): { isValid: boolean; errors: GuestIdentityErrors[] } {
  const results = identities.map((identity) => validateGuestIdentity(identity));

  return {
    isValid: results.every((result) => result.isValid),
    errors: results.map((result) => result.errors),
  };
}
