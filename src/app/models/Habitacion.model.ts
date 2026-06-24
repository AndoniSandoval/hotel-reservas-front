export interface HabitacionRequest{
numeroHabitacion:string,
    tipoHabitacion: string ,
    precioNoche:Number,
    capacidad:number

}

export interface HabitacionResponse{
idHabitacion: string,
numeroHabitacion: number,
tipoHabitacion: string,
precioNoche: number,
capacidad: number,
estadoHabitacion: string,
fechaCreacion: string,
fechaActualizacion: string
}