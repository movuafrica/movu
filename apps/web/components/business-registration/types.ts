export type RegistrationFormData = {
  fullName: string;
  email: string;
  phoneNumber: string;
  country: string;
  businessName: string;
  businessRegistrationNumber: string;
  taxId: string;
  address: string;
  postalCode: string;
  city: string;
  tradeRole: string;
};

export const INITIAL_FORM_DATA: RegistrationFormData = {
  fullName: '',
  email: '',
  phoneNumber: '',
  country: '',
  businessName: '',
  businessRegistrationNumber: '',
  taxId: '',
  address: '',
  postalCode: '',
  city: '',
  tradeRole: '',
};

export type StepProps = {
  formData: RegistrationFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: keyof RegistrationFormData, value: string) => void;
};
