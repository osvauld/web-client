import { CredentialFieldComponentProps } from "../../dtos";
import { getDomain } from "../../helper";

export const fieldEditHandler = (
	field: CredentialFieldComponentProps,
	credentialFields,
	edit,
) => {
	let changedFields = new Set();
	if (edit && field.fieldId) {
		changedFields.add(field.fieldId);
		if (field.fieldName === "URL") {
			for (const fieldData of credentialFields) {
				if (fieldData.fieldName === "Domain") {
					changedFields.add(fieldData.fieldId);
					const updatedDomain = getDomain(field.fieldValue);
					fieldData.fieldValue = updatedDomain;
				}
			}
		}
	}
	return changedFields;
};
