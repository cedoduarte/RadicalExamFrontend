export interface IExcelRecord {
    firstName: string;
    middleName: string;
    firstLastName: string;
    secondLastName: string;
    birthdate: string;
    rfc: string;
    neighborhood: string;
    delegationOrMunicipality: string;
    city: string;
    state: string;
    zipCode: string;
    address: string;
    currentBalance: number;
    creditLimit: number;
    balanceDue: number;
    availableBalance: number;
}

export interface IExcelDocument {
    records: IExcelRecord[];
}