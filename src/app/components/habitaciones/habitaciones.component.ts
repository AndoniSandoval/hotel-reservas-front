import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HabitacionRequest, HabitacionResponse } from '../../models/Habitacion.model';
import { HabitacionesService } from '../../services/habitaciones.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { TipoHabitacion } from '../../constants/TipoHabitacion';

declare var bootstrap: any;

@Component({
  selector: 'app-habitaciones',
  standalone: false,
  templateUrl: './habitaciones.component.html',
  styleUrl: './habitaciones.component.css'
})


export class HabitacionesComponent implements OnInit, AfterViewInit{
textoModal:string = 'Registrar habitacion';
habitacionForm: FormGroup;
habitaciones: HabitacionResponse[]=[];
@ViewChild('habitacionModalRef') habitacionModalEl!: ElementRef;
private modalInstance!: any;
idHabitacion:string | null =null;
selectedHabitacion: HabitacionResponse | null = null;
tiposHabitacion:string[] = Object.values(TipoHabitacion);



ngAfterViewInit(): void {
  this.modalInstance = new bootstrap.Modal(this.habitacionModalEl.nativeElement,{keyboard:false});
  this.habitacionModalEl.nativeElement.addEventListener('hidden.bs.modadl',()=> {
    this.resetForm();
  });
}
constructor(private fb: FormBuilder,private habitacionServicio:HabitacionesService){

this.habitacionForm = this.fb.group({
    
    numeroHabitacion:['',[Validators.required, Validators.min(1), Validators.max(999)]],
    tipoHabitacion:[{},[Validators.required]],
    precioNoche:['',[Validators.required,Validators.min(0.01), Validators.max(10000)]],
    capacidad:['',[Validators.min(1),Validators.required, Validators.min(1), Validators.max(10)]]
  });
}


ngOnInit(): void {
this.listarHabitaciones();
  
}

listarHabitaciones():void{

  this.habitacionServicio.getHabitaciones().subscribe({next: resp => {
    
    this.habitaciones= resp;
  },error: (error) => {
    console.error('Error al listar las habitaciones',error);
    Swal.fire('Error','No se pudieron las habitaciones','error')
  }
  });
}

toggleForm():void{
  this.textoModal = 'Registrar nueva habitacion';
  this.modalInstance.show();
  this.resetForm();
}

resetForm():void {
  this.idHabitacion =null;
  this.habitacionForm.reset();
  this.habitacionForm.get('tipoHabitacion')?.setValue('');
}









/* acciones */
onSubmit():void {
  if(this.habitacionForm.invalid) return;

  
  const datoshabitacion: HabitacionRequest = this.habitacionForm.value;
  if(this.idHabitacion && this.selectedHabitacion){
    ///actualizando
    this.habitacionServicio.putHabitaciones(datoshabitacion,this.idHabitacion).subscribe({
      next: resp=>{
        const index = this.habitaciones.findIndex(habitacion=> habitacion.idHabitacion === this.idHabitacion);
        if (index !== -1) {
        this.habitaciones[index] = resp;
        this.modalInstance.hide();
        Swal.fire('Actualizacion correcta','Se actualizo correctamente la habitacion','success');
      }
      }
    });


  }else{
    this.habitacionServicio.postHabitaciones(datoshabitacion).subscribe({
      next: resp => {
        this.habitaciones.push(resp);
        this.modalInstance.hide();
        Swal.fire('Registro correcto','Se creo correctamente la habitacion','success');
      }
    })
  }
}


eliminarHabitacion(idHabitacion: string): void {
    Swal.fire({
      title: 'Estas seguro?',
      text: `La habitacion sera eliminado permanentemente`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.habitacionServicio.deleteHabitaciones(idHabitacion).subscribe({
          next: () => {
            this.habitaciones=this.habitaciones.filter(habitacion => habitacion.idHabitacion !== idHabitacion);
            Swal.fire('Eliminado', 'Se elimino la habitacion', 'success')
          }
        })
      }
    })

  }

  actualizar(habitacion:HabitacionResponse):void{
  this.idHabitacion = habitacion.idHabitacion;
  this.textoModal = 'Actualizar habitacion';
  this.selectedHabitacion = habitacion;
  this.habitacionForm.patchValue({ ...habitacion});
  this.modalInstance.show();

  }








}
