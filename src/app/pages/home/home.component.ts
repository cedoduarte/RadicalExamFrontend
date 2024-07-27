import { Component, inject, OnInit } from '@angular/core';
import { FileUploadComponent } from "../../components/file-upload/file-upload.component";
import { HttpClient } from "@angular/common/http";
import { share } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DocumentTableViewComponent } from '../../components/document-table-view/document-table-view.component';
import { IBanxicoSerie, IExcelDocument, IExcelRecord } from '../../shared/interfaces';
import { CommonModule } from '@angular/common';
import { UPLOAD_FILE_ENDPOINT, WEATHER_TEMPERATURE_ENDPOINT, BANXICO_EXCHANGE_RATE_ENDPOINT } from '../../shared/constants';
import { Chart, registerables } from "chart.js";
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { DatePipe } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FileUploadComponent,
    DocumentTableViewComponent,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule
  ],
  providers: [provideNativeDateAdapter(), DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  http = inject(HttpClient);
  toastr = inject(ToastrService);
  datePipe = inject(DatePipe);
  excelRecords: IExcelRecord[] = [];

  // statistics
  minCurrentBalanceRecord: IExcelRecord | null = null;
  maxCurrentBalanceRecord: IExcelRecord | null = null;
  currentBalanceSum: number = 0.0;
  creditLimitSum: number = 0.0;
  availableBalanceSum: number = 0.0;
  balanceDueSum: number = 0.0;
  stateCurrentBalance: Map<string, number> = new Map();
  stateCurrentBalanceChart: any;
  balancePieChart: any;
  cityName: string = "Hermosillo";
  currentCityTemperature: string = "loading...";

  // pagination
  currentPage: number = 1;
  recordCountPerPage: number = 10;
  pageCount: number = 0;
  numberList: Array<number> = [];
  lastIndex: number = -1;
  firstIndex: number = -1;
  recordList: IExcelRecord[] = [];

  // banxico
  startDate: string | null = "";
  endDate: string | null = "";
  banxicoForm = new FormGroup({
    banxicoToken: new FormControl("", Validators.required),
    startDate: new FormControl("", Validators.required),
    endDate: new FormControl("", Validators.required)
  });

  ngOnInit() {
    this.getCurrentCityTemperature();
  }

  getCurrentCityTemperature() {
    this.http.get<string>(`${WEATHER_TEMPERATURE_ENDPOINT}/${this.cityName}`).pipe(share())
      .subscribe(data => {
        this.currentCityTemperature = data;
      }, errorObject => {
        this.toastr.error(errorObject.error);
      });
  }

  fileUploaded(event: any) {
    let formData = event as FormData;
    this.http.post<IExcelDocument>(UPLOAD_FILE_ENDPOINT, formData).pipe(share())
      .subscribe(data => {
        let { records } = data as IExcelDocument;
        this.excelRecords = records;
        this.computeStatistics();
        this.updatePagination();
        this.updateRecords();
      }, errorObject => {
        this.toastr.error(errorObject.error);
      });
  }

  computeMinAndMaxCurrentBalanceRecords() {
    let minCurrentBalanceIndex: number = -1;
    let maxCurrentBalanceIndex: number = -1;
    let minCurrentBalance: number = Number.MAX_VALUE;
    let maxCurrentBalance: number = Number.MIN_VALUE;
    for (let iRecord = 0; iRecord < this.excelRecords.length; iRecord++) {
      const currentBalance = this.excelRecords[iRecord].currentBalance;
      if (currentBalance < minCurrentBalance) {
        minCurrentBalance = currentBalance;
        minCurrentBalanceIndex = iRecord;
      }
      if (currentBalance > maxCurrentBalance) {
        maxCurrentBalance = currentBalance;
        maxCurrentBalanceIndex = iRecord;
      }
    }
    this.minCurrentBalanceRecord = this.excelRecords[minCurrentBalanceIndex];
    this.maxCurrentBalanceRecord = this.excelRecords[maxCurrentBalanceIndex];
  }

  getCurrentBalanceSum(): number {
    let sum: number = 0.0;
    for (let iRecord = 0; iRecord < this.excelRecords.length; iRecord++) {
      sum += this.excelRecords[iRecord].currentBalance;
    }
    return sum;
  }

  getCreditLimitSum(): number {
    let sum: number = 0.0;
    for (let iRecord = 0; iRecord < this.excelRecords.length; iRecord++) {
      sum += this.excelRecords[iRecord].creditLimit;
    }
    return sum;
  }

  getAvailableBalanceSum(): number {
    let sum: number = 0.0;
    for (let iRecord = 0; iRecord < this.excelRecords.length; iRecord++) {
      sum += this.excelRecords[iRecord].availableBalance;
    }
    return sum;
  }

  getBalanceDueSum(): number {
    let sum: number = 0.0;
    for (let iRecord = 0; iRecord < this.excelRecords.length; iRecord++) {
      sum += this.excelRecords[iRecord].balanceDue;
    }
    return sum;
  }

  computeStateCurrentBalance() {
    for (let iRecord = 0; iRecord < this.excelRecords.length; ++iRecord) {
      const stateName: string = this.excelRecords[iRecord].state;
      const currentBalance: number = this.excelRecords[iRecord].currentBalance;
      if (this.stateCurrentBalance.has(stateName)) {
        const stateBalance: number | undefined = this.stateCurrentBalance.get(stateName);
        if (stateBalance) {
          const newStateBalance: number = stateBalance + currentBalance;
          this.stateCurrentBalance.set(stateName, newStateBalance);
        }
      } else {
        this.stateCurrentBalance.set(stateName, currentBalance);
      }
    }
  }

  createStateCurrentBalanceChart() {
    this.stateCurrentBalanceChart = new Chart("stateCurrentBalanceChart", {
      type: "bar",
      data: {
        labels: Array.from(this.stateCurrentBalance.keys()),
        datasets: [
          {
            label: "Saldo actual",
            data: Array.from(this.stateCurrentBalance.values())
          }
        ]
      },
      options: {
        aspectRatio: 1
      }
    });
  }

  createBalancePieChart() {
    const currentBalancePercentage: number = this.currentBalanceSum * 100.0 / this.creditLimitSum;
    const availableBalancePercentage: number = this.availableBalanceSum * 100.0 / this.creditLimitSum;
    this.balancePieChart = new Chart("balancePieChart", {
      type: "pie",
      data: {
        labels: ["Saldo actual", "Saldo disponible"],
        datasets: [
          {
            label: "Porcentaje de saldo",
            data: [currentBalancePercentage, availableBalancePercentage]
          }
        ]
      },
      options: {
        aspectRatio: 1
      }
    });
  }

  computeStatistics() {
    this.computeMinAndMaxCurrentBalanceRecords();
    this.currentBalanceSum = this.getCurrentBalanceSum();
    this.creditLimitSum = this.getCreditLimitSum();
    this.availableBalanceSum = this.getAvailableBalanceSum();
    this.balanceDueSum = this.getBalanceDueSum();
    this.computeStateCurrentBalance();
    this.createStateCurrentBalanceChart();
    this.createBalancePieChart();
  }

  getRecordFullName(record: IExcelRecord | null): string {
    if (record == null) {
      return "Ninguno";
    }
    return `${record.firstName.length === 0 ? '' : record.firstName}${record.middleName.length === 0 ? '' : ' ' + record.middleName}${record.firstLastName.length === 0 ? '' : ' ' + record.firstLastName}${record.secondLastName.length === 0 ? '' : ' ' + record.secondLastName}`;
  }

  updatePagination() {
    this.pageCount = Math.ceil(this.excelRecords.length / this.recordCountPerPage);
    this.numberList = [...Array(this.pageCount + 1).keys()].slice(1);
  }

  updateRecords() {
    this.lastIndex = this.currentPage * this.recordCountPerPage;
    this.firstIndex = this.lastIndex - this.recordCountPerPage;
    this.recordList = this.excelRecords.slice(this.firstIndex, this.lastIndex);
  }

  previousPage() {
    if (this.currentPage !== 1) {
      this.currentPage--;
      this.updateRecords();
    }
  }

  changeCurrentPage(pageIndex: number) {
    this.currentPage = pageIndex;
    this.updateRecords();
  }

  nextPage() {
    if (this.currentPage !== this.pageCount) {
      this.currentPage++;
      this.updateRecords();
    }
  }

  startDateChange(event: any) {
    const selectedDate = event.value;
    this.startDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
  }
  
  endDateChange(event: any) {
    const selectedDate = event.value;
    this.endDate = this.datePipe.transform(selectedDate, 'yyyy-MM-dd');
  }

  banxicoFormSubmit() {
    if (!this.banxicoForm.valid) {
      if (!this.banxicoForm.controls.banxicoToken.valid) {
        this.toastr.error("¡Necesita ingresar un token para poder usar Banxico!");
      } else if (!this.banxicoForm.controls.startDate.valid) {
        this.toastr.error("¡Necesita ingresar una fecha de inicio!");
      } else if (!this.banxicoForm.controls.endDate.valid) {
        this.toastr.error("¡Necesita ingresar una fecha de fin!");
      }
      return;
    }
    const banxicoToken: string | null | undefined = this.banxicoForm.value.banxicoToken;
    this.http.get<IBanxicoSerie>(`${BANXICO_EXCHANGE_RATE_ENDPOINT}/${this.startDate}/${this.endDate}/${banxicoToken}`).pipe(share())
    .subscribe(data => {
      const serie: IBanxicoSerie = data;
      console.log(serie);
    }, errorObject => {
      this.toastr.error(errorObject.error);
    });
  }
}
