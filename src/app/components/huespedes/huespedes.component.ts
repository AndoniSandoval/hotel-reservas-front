import {
  AfterViewInit, Component, ElementRef, OnInit, ViewChild
} from '@angular/core';

import { HuespedRequest, HuespedResponse } from '../../models/Huesped.model';
import { HuespedesService } from '../../services/huespedes.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-huespedes',
  standalone: false,
  templateUrl: './huespedes.component.html',
  styleUrl: './huespedes.component.css'
})
export class HuespedesComponent implements OnInit, AfterViewInit {

  textoModal: string = 'Registrar huésped';
  huespedForm: FormGroup;
  huespedes: HuespedResponse[] = [];
  loading: boolean = false;

  @ViewChild('huespedModalRef') huespedModalEl!: ElementRef;
  private modalInstance!: any;

  idHuesped: number | null = null;
  selectedHuesped: HuespedResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private huespedService: HuespedesService
  ) {
    this.huespedForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellidoMaterno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      documento: ['', [Validators.required]],
      nacionalidad: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.listarHuespedes();
  }

  ngAfterViewInit(): void {
    this.modalInstance = new bootstrap.Modal(this.huespedModalEl.nativeElement, { keyboard: false });

    this.huespedModalEl.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.resetForm();
    });
  }

  listarHuespedes(): void {
    this.huespedService.getHuespedes().subscribe({
      next: resp => this.huespedes = resp,
      error: error => {
        console.error(error);
        Swal.fire('Error', 'No se pudieron cargar los huéspedes', 'error');
      }
    });
  }

  toggleForm(): void {
    this.textoModal = 'Registrar huésped';
    this.loading = false;
    this.resetForm();
    this.modalInstance.show();
  }

  resetForm(): void {
    this.idHuesped = null;
    this.selectedHuesped = null;
    this.huespedForm.reset();
    this.huespedForm.markAsPristine();
    this.huespedForm.markAsUntouched();
  }

  onSubmit(): void {
    if (this.huespedForm.invalid) {
      this.huespedForm.markAllAsTouched();
      return;
    }

    const datosHuesped: HuespedRequest = this.huespedForm.value;

    if (this.idHuesped && this.selectedHuesped) {
      this.actualizarHuesped(datosHuesped);
    } else {
      this.crearHuesped(datosHuesped);
    }
  }

  crearHuesped(huesped: HuespedRequest): void {
    this.loading = true;
    this.huespedService.postHuesped(huesped).subscribe({
      next: () => {
        this.loading = false;
        this.listarHuespedes();
        this.modalInstance.hide();
        Swal.fire('Correcto', 'Huésped registrado correctamente', 'success');
      },
      error: error => {
        this.loading = false;
        this.manejarError(error);
      }
    });
  }

  actualizarHuesped(huesped: HuespedRequest): void {
    this.loading = true;
    this.huespedService.putHuesped(huesped, this.idHuesped!).subscribe({
      next: () => {
        this.loading = false;
        this.listarHuespedes();
        this.modalInstance.hide();
        Swal.fire('Correcto', 'Huésped actualizado correctamente', 'success');
      },
      error: error => {
        this.loading = false;
        this.manejarError(error);
      }
    });
  }

  eliminarHuesped(idHuesped: number): void {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'El huésped será eliminado',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (!result.isConfirmed) return;

      this.huespedService.deleteHuesped(idHuesped).subscribe({
        next: () => {
          this.listarHuespedes();
          Swal.fire('Eliminado', 'Huésped eliminado correctamente', 'success');
        },
        error: error => this.manejarError(error)
      });
    });
  }

  actualizar(huesped: HuespedResponse): void {
    this.idHuesped = huesped.id;
    this.selectedHuesped = huesped;
    this.textoModal = 'Actualizar huésped';

    this.huespedForm.patchValue({
      nombre: huesped.nombre,
      apellidoPaterno: huesped.apellidoPaterno,
      apellidoMaterno: huesped.apellidoMaterno,
      email: huesped.email,
      telefono: huesped.telefono,
      documento: huesped.documento,
      nacionalidad: huesped.nacionalidad
    });

    this.modalInstance.show();
  }

  private manejarError(error: any): void {
    if (error.status === 400) {
      Swal.fire('Datos inválidos', 'Verifica la información capturada', 'warning');
      return;
    }
    if (error.status === 404) {
      Swal.fire('No encontrado', 'El huésped no existe', 'warning');
      return;
    }
    if (error.status === 409) {
      Swal.fire('Duplicado', 'Ya existe un huésped activo con ese email, teléfono o documento', 'warning');
      return;
    }

    Swal.fire('Error', 'Ocurrió un error inesperado', 'error');
  }
}