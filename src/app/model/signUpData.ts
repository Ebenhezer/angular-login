export class SignUpData{
    private firstname: string;
    private lastname: string;
    private email: string;
    private password: string;
    private cellphone: string;
    private gender: string;

    constructor(firstname: string, lastname: string, email: string, password: string, cellphone: string, gender: string){
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
        this.cellphone = cellphone;
        this.gender = gender;
    }

    getFirstname(): string {
        return this.firstname;
    }
    getLastname(): string {
        return this.lastname;
    }
    getEmail(): string {
        return this.email;
    }
    getPassword(): string {
        return this.password;
    }
    getCellphone(): string {
        return this.cellphone;
    }
    getGender(): string {
        return this.gender;
    }
}