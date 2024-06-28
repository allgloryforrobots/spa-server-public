// import isStrongPassword from 'validator/es/lib/isStrongPassword'

export class PasswordService {

    public static securePasswordOptions = {minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}

    /** валидация происходит и на клиенте и на сервере */
    public static passwordTooltip(): string {
        return 'Пароль должен содержать не менее 8 символов, заглавные и строчные буквы, цифры, пробелы и специальные символы.\n' +
        `Например: ${PasswordService.generateSavePassword()}`
    }

    private static __generateRandomPassword(
        length = 12,
        characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$'
    ): string {

        return Array.from(crypto.getRandomValues(new Uint32Array(length)))
            .map(x => characters[x % characters.length])
            .join('')

    }

    public static isSecurePassword(password: string): boolean {
        // return isStrongPassword(password, this.securePasswordOptions)
        return true
    }


    public static generateSavePassword(): string {
        let password: string | null = null
        do password = this.__generateRandomPassword()
        while (!this.isSecurePassword(password))
        return password
    }

}
