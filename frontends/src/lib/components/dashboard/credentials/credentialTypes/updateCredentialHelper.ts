
import {
	EncryptedEditField,
	EditedUserField,
	EnvField,
	NewFieldPayload,
} from "../../../../dtos/credential.dto";



export const updateCredentialHandler = async (
	credentialData: any,
	credentialId: string | undefined,
) => {

	return {
		success: false,
		message:
			"Failed to add credential",
	};
};
