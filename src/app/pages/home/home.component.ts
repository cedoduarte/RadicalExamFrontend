import { Component, inject } from '@angular/core';
import { FileUploadComponent } from "../../components/file-upload/file-upload.component";
import { HttpClient, provideHttpClient } from "@angular/common/http";
import { share } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FileUploadComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  http = inject(HttpClient);

  fileUploaded(event: any) {
    let formData = event as FormData;
    this.http.post("https://localhost:7105/api/Upload/upload", formData).pipe(share())
    .subscribe(data => {
      console.log(data);
    }, errorObject => {
      console.log(errorObject.error);
    });
  }
}
