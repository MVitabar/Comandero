import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const createEstablishmentUser = functions.https.onCall(async (data: any, context: any) => {
  // Validar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  // Validar campos requeridos
  if (
    !data.username ||
    !data.establishmentName ||
    !data.password ||
    !data.role ||
    !data.establishmentId
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required user data."
    );
  }

  // Validar longitud del username
  if (data.username.length < 3) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "El nombre de usuario debe tener al menos 3 caracteres"
    );
  }

  // Generar email interno
  const internalEmail = `${data.username.trim().replace(/\s+/g, '.').toLowerCase()}@${data.establishmentName.trim().replace(/\s+/g, '-').toLowerCase()}.com`;

  try {
    // Crear usuario en Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: internalEmail,
      password: data.password,
      displayName: data.username,
      emailVerified: true,
      disabled: false
    });

    // Guardar usuario en Firestore bajo el establecimiento
    await admin.firestore()
      .doc(`restaurants/${data.establishmentId}/users/${userRecord.uid}`)
      .set({
        uid: userRecord.uid,
        email: internalEmail,
        username: data.username,
        role: data.role,
        establishmentId: data.establishmentId,
        establishmentName: data.establishmentName,
        isInternalAccount: true,
        createdBy: context.auth.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

    return { success: true, userId: userRecord.uid, email: internalEmail };
  } catch (error: any) {
    throw new functions.https.HttpsError(
      "internal",
      error.message || "Error creating user"
    );
  }
});
