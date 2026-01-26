import { useState } from "react";
import { Phone } from "lucide-react";

/**
 * PhoneInput Component - Standardized phone input with Cameroon format validation
 * Format: +237 XXX XXX XXX
 */
export function PhoneInput({ value, onChange, required = false, className = "" }) {
  const [error, setError] = useState("");

  const formatPhoneNumber = (input) => {
    // Remove all non-digit characters except +
    let cleaned = input.replace(/[^\d+]/g, "");
    
    // Ensure it starts with +237
    if (!cleaned.startsWith("+237")) {
      if (cleaned.startsWith("237")) {
        cleaned = "+" + cleaned;
      } else if (cleaned.startsWith("+")) {
        cleaned = "+237";
      } else if (cleaned.length > 0) {
        cleaned = "+237" + cleaned;
      } else {
        cleaned = "+237 ";
      }
    }
    
    // Extract the digits after +237
    const digits = cleaned.slice(4).replace(/\D/g, "");
    
    // Format as +237 XXX XXX XXX
    let formatted = "+237";
    if (digits.length > 0) {
      formatted += " " + digits.slice(0, 3);
    }
    if (digits.length > 3) {
      formatted += " " + digits.slice(3, 6);
    }
    if (digits.length > 6) {
      formatted += " " + digits.slice(6, 9);
    }
    
    return formatted;
  };

  const validatePhoneNumber = (phone) => {
    // Valid format: +237 followed by exactly 9 digits
    const phoneRegex = /^\+237\s?\d{3}\s?\d{3}\s?\d{3}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const handleChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(formatted);
    
    // Validate if field is not empty
    if (formatted.length > 5) {
      if (!validatePhoneNumber(formatted)) {
        setError("Format invalide. Attendu: +237 XXX XXX XXX");
      } else {
        setError("");
      }
    } else {
      setError("");
    }
  };

  const handleBlur = () => {
    if (required && value.length <= 5) {
      setError("Le numéro de téléphone est requis");
    } else if (value.length > 5 && !validatePhoneNumber(value)) {
      setError("Format invalide. Attendu: +237 XXX XXX XXX");
    }
  };

  return (
    <div className="space-y-1">
      <div className="relative">
        <Phone
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="+237 678 850 780"
          required={required}
          className={`ft-input pl-12 ${error ? "border-red-500" : ""} ${className}`}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500 ml-1 font-medium">{error}</p>
      )}
    </div>
  );
}
