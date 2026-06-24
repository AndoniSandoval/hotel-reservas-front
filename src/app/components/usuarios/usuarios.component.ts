import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UsuarioRequest, UsuarioResponse } from '../../models/Usuario.model';
import Swal from 'sweetalert2';
import { DescripcionesRoles, Roles } from '../../constants/Roles';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { Observable } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-usuarios',
  standalone: false,
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit, AfterViewInit {
textoModal:string = 'Registrar usuario';
usuarioForm:FormGroup;
roles:string[] = Object.values(Roles);
isEditMode: boolean =false;
selectedUsuario: UsuarioResponse | null = null;


@ViewChild('usuarioModalRef') usuarioModalEl!: ElementRef;
private modalInstance!: any;

listarUsuarios():void{

  this.usuarioService.getUsuarios().subscribe({next: resp => {
    
    this.usuarios= resp;
  },error: (error) => {
    console.error('Error al listar usuarios',error);
    Swal.fire('Error','No se pudieron cargar los usuarios','error')
  }
  });
}

 constructor(private fb: FormBuilder, private usuarioService:UsuariosService){
  this.usuarioForm = this.fb.group({
    
    username:['',[Validators.required, Validators.minLength(5),Validators.maxLength(50)]],
    password:['',[Validators.required, Validators.minLength(8)]],
    roles:[{},[Validators.required]]
  });
};

onSubmit():void {
  if(this.usuarioForm.invalid) return;

  
  const datosUsuario: UsuarioRequest = this.usuarioForm.value;
  if(this.isEditMode && this.selectedUsuario){

    //actualizando
    this.usuarioService.putUsuario(datosUsuario,datosUsuario.username).subscribe({
      next: updated => {
        const index:number = this.usuarios.findIndex(usuario=> usuario.username === this.selectedUsuario?.username);
        if(index !==-1) this.usuarios[index] = updated;

        Swal.fire('Actualizado','Usuario actualizado correctamente','success');
        this.modalInstance.hide();
      }
    });
  }else{
    //registrando
    this.usuarioService.postUsuario(datosUsuario).subscribe({next: resp=>{
    this.usuarios.push(resp);
    Swal.fire('Registrado','Usuario registrado correctamente','success');
    this.modalInstance.hide();
  }/* ,error: (error)=> {
    console.error('Error al registrar usuario',error);
    Swal.fire('Error','No se pudo registrar el usuario','error')
  } */})

  }


  


  
}

ngOnInit(): void {
this.listarUsuarios();
}
usuarios: UsuarioResponse[] = [];

tranformarRol(rol:string): string{
  return DescripcionesRoles[rol as Roles] || 'Desconocido';
}

  eliminarUsuario(username: string): void {
    Swal.fire({
      title: 'Estas seguro?',
      text: `El usuario "${username}" sera eliminado permanentemente`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.usuarioService.deleteUsuario(username).subscribe({
          next: () => {
            this.usuarios.filter(usuario => usuario.username !== username);
            Swal.fire('Eliminado', 'Se elimino el usuario', 'success')
          }, error: (error) => {
            console.error('Error al eliminar usuario', error);
            Swal.fire('Error', 'No se pudo eliminar el usuario', 'error')
          }
        })
      }
    })

  }
ngAfterViewInit(): void {
  this.modalInstance = new bootstrap.Modal(this.usuarioModalEl.nativeElement,{keyboard:false});
  this.usuarioModalEl.nativeElement.addEventListener('hidden.bs.modadl',()=> {
    this.resetForm();
  });
}

toggleForm():void{
  this.textoModal = 'Registrar modal';
  this.modalInstance.show();
  this.resetForm();
}

resetForm():void {
  this.isEditMode =false;
  this.usuarioForm.reset();
  this.usuarioForm.get('roles')?.setValue([]);
}

editarUsuario(usuario: UsuarioResponse): void {
  this.isEditMode = true;
  this.selectedUsuario = usuario;
  this.textoModal = 'Actualizando usuario';

  this.usuarioForm.patchValue({ ...usuario});
  this.modalInstance.show();
}



}
