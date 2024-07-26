import { Component, Input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { IExcelRecord } from '../../shared/interfaces';

@Component({
  selector: 'app-document-table-view',
  standalone: true,
  imports: [MatTableModule],
  templateUrl: './document-table-view.component.html',
  styleUrl: './document-table-view.component.css'
})
export class DocumentTableViewComponent {
  public displayedColumns: string[] = [ 
    "PRIMER_NOMBRE",
    "SEGUNDO_NOMBRE",
    "APELLIDO_PATERNO",
    "APELLIDO_MATERNO",
    "FECHA_DE_NACIMIENTO",
    "RFC",
    "COLONIA_O_POBLACION",
    "DELEGACION_O_MUNICIPIO",
    "CIUDAD",
    "ESTADO",
    "C.P.",
    "DIRECCION_CALLE_NUMERO",
    "SALDO_ACTUAL",
    "LIMITE_DE_CREDITO",
    "SALDO_VENCIDO",
    "SALDO_DISPONIBLE"
  ];

  @Input() excelRecords: IExcelRecord[] = [];
}
