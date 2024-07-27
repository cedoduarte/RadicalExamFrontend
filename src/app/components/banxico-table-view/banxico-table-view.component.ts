import { Component, Input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { IBanxicoRecord } from '../../shared/interfaces';

@Component({
  selector: 'app-banxico-table-view',
  standalone: true,
  imports: [MatTableModule],
  templateUrl: './banxico-table-view.component.html',
  styleUrl: './banxico-table-view.component.css'
})
export class BanxicoTableViewComponent {
  public displayedColumns: string[] = [
    "FECHA",
    "VALOR"
  ];

  @Input() banxicoRecords: IBanxicoRecord[] = [];
}
