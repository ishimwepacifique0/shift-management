class PathVariable {
    // Auth endpoints
    LOGIN: string = '/auth/login';
    REGISTER: string = '/auth/register';
    FORGOT_PASSWORD: string = '/auth/forgot-password';
    RESET_PASSWORD: string = '/auth/reset-password';
    VERIFY_EMAIL: string = '/auth/verify-email';
    VERIFY_EMAIL_TOKEN: string = '/auth/verify-email-token';
    ME: string = '/auth/me';
    LOGOUT: string = '/auth/logout';
    CHANGE_PASSWORD: string = '/auth/change-password';

    // Staff endpoints
    STAFF: string = '/staff';
    STAFF_BY_ID: string = '/staff';
    STAFF_BY_COMPANY: string = '/staff/company';
    COMPANY_STAFF: string = '/company/staff';

    // Client endpoints
    CLIENTS: string = '/clients';
    CLIENT_BY_ID: string = '/clients';
    CLIENTS_BY_COMPANY: string = '/clients/company';

    // Shift endpoints
    SHIFTS: string = '/shifts';
    SHIFT_BY_ID: string = '/shifts';
    SHIFTS_BY_STAFF: string = '/shifts/staff';
    SHIFTS_BY_CLIENT: string = '/shifts/client';

    // Company endpoints
    COMPANIES: string = '/companies';
    COMPANY_BY_ID: string = '/companies';

    // User endpoints
    USERS: string = '/users';
    USER_BY_ID: string = '/users';
    USERS_BY_COMPANY: string = '/users/company';
}

export default new PathVariable();

