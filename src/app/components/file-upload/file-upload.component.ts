import { Component, EventEmitter, Output, inject } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [MatButtonModule, MatInputModule, FormsModule, ReactiveFormsModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})
export class FileUploadComponent {
  toastr = inject(ToastrService);
  @Output() formDataReady = new EventEmitter<FormData>();
  private selectedFile: File | null = null;

  uploadFileForm = new FormGroup({
    fileName: new FormControl("", Validators.required)
  });

  onSubmit() {
    if (this.selectedFile) {
      let formData = new FormData();
      formData.append("file", this.selectedFile, this.selectedFile.name);
      this.formDataReady.emit(formData);
      this.toastr.success("OK");
    } else {
      this.toastr.error("¡Debe seleccionar un archivo antes de enviarlo!");
    }
  }

  triggerFileInput() {
    document.getElementById('file-input')?.click();
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0] as File;
    this.uploadFileForm.setValue({ fileName: this.selectedFile.name });
  }
}
