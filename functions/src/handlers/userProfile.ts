import * as admin from 'firebase-admin';
import { z } from "zod";
import { createApiHandler } from "../utils/handlers";
import { withValidation } from "../utils/validation";

// Define valid user roles (matching frontend constants)
const USER_ROLES = [
  'Product Manager',
  'Software Engineer',
] as const;

// Define the schema for the updateUserProfile function's input
const updateUserProfileSchema = z.object({
  role: z.enum(USER_ROLES, { 
    errorMap: () => ({ message: "Invalid role selected. Please choose from the available options." }) 
  }),
  persona: z.string().max(1000, { message: "Persona description must be less than 1000 characters." }).nullable().optional(),
});

// The core user profile update logic
const updateUserProfileHandler = withValidation(
  updateUserProfileSchema,
  async ({ role, persona }, auth) => {
    if (!auth?.uid) {
      throw new Error('User must be authenticated to update profile');
    }

    const db = admin.firestore();
    const userRef = db.collection('users').doc(auth.uid);

    const updateData: any = {
      role,
      onboardingCompleted: true,
    };

    if (persona !== undefined && persona !== null) {
      updateData.persona = persona;
    }
    await userRef.update(updateData);
    return { 
      success: true, 
      message: "Profile updated successfully",
      data: { role, persona }
    };
  },
);

// Export the final, wrapped function
export const updateUserProfile = createApiHandler(updateUserProfileHandler); 