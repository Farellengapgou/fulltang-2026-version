/**
 * Extracts a user-friendly error message from an Axios error response.
 * Handles DRF's various error response formats (field errors, detail, non-field errors).
 *
 * @param {object} error - The Axios error object
 * @param {string} fallbackMessage - Fallback message if no specific error can be extracted
 * @returns {string} A formatted error message
 */
export function extractApiError(error, fallbackMessage = "Something went wrong. Please try again.") {
    if (!error.response?.data) {
        if (error.message === "Network Error") {
            return "Unable to connect to the server. Please check your internet connection.";
        }
        return fallbackMessage;
    }

    const data = error.response.data;

    // Case 1: Simple string response
    if (typeof data === 'string') {
        return data;
    }

    // Case 2: { detail: "..." } format (DRF standard)
    if (data.detail && typeof data.detail === 'string') {
        return data.detail;
    }

    // Case 3: { non_field_errors: [...] } format
    if (data.non_field_errors) {
        return Array.isArray(data.non_field_errors)
            ? data.non_field_errors.join(" ")
            : data.non_field_errors;
    }

    // Case 4: Field-specific errors { field: ["error1", "error2"], ... }
    if (typeof data === 'object') {
        const fieldLabels = {
            username: "Username",
            email: "Email",
            password: "Password",
            first_name: "First name",
            last_name: "Last name",
            role: "Specialisation",
            cniNumber: "ID Card Number",
            phoneNumber: "Phone Number",
            birthDate: "Birth Date",
            gender: "Gender",
            address: "Address",
            userType: "User Type",
            name: "Name",
            generic_name: "Generic Name",
            brand: "Brand",
            price: "Price",
            category: "Category",
            current_stock: "Stock",
            expiry_date: "Expiry Date",
            description: "Description",
        };

        const messages = Object.entries(data)
            .map(([key, value]) => {
                const label = fieldLabels[key] || key;
                const errorText = Array.isArray(value) ? value.join(", ") : value;
                return `${label}: ${errorText}`;
            });

        if (messages.length > 0) {
            return messages.join("\n");
        }
    }

    return fallbackMessage;
}
