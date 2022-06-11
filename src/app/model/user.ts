export class User {

    constructor(public userId: string = '',
        public firstName: string = '',
        public lastName: string = '',
        public username: string = '',
        public password: string = '',
        public email: string = '',
        public profileImageUrl: string = '',
        public lastLoginDate: Date | null = null,
        public lastLoginDateDisplay: Date | null = null,
        public joinDate: Date | null = null,
        public role: string = '',
        public authorities: string[] = [],
        public isActive: boolean = false,
        public isNotLocked: boolean = false) { }

}
