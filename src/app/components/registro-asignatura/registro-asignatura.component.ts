import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { Auth } from '@angular/fire/auth';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-registro-asignatura',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro-asignatura.component.html',
  styleUrls: ['./registro-asignatura.component.css']
})
export class RegistroAsignaturaComponent {

  materias: any = {
    "Matemáticas I (Cálculo diferencial)":4,
    "Matemáticas II (Cálculo integral)":4,
    "Matemáticas III (Cálculo multivariable)":4,
    "Álgebra lineal":3,
    "Probabilidad y estadística":3,
    "Estadística aplicada":3,
    "Estructuras discretas":3,
    "Matemáticas discretas":3,
    "Introducción a la programación":3,
    "Lógica y algoritmos":3,
    "Programación orientada a objetos":4,
    "Estructuras de datos":4,
    "Análisis de algoritmos":3,
    "Sistemas operativos":4,
    "Arquitectura de computadores":3,
    "Bases de datos I":3,
    "Bases de datos II":3,
    "Desarrollo web":3,
    "Desarrollo de aplicaciones móviles":3,
    "Ingeniería de software I":3,
    "Ingeniería de software II":3,
    "Arquitectura de software":3,
    "Redes de computadores I":3,
    "Redes de computadores II":3,
    "Sistemas distribuidos":3,
    "Computación en la nube":3,
    "Seguridad informática":3
  };

  listaMaterias = Object.keys(this.materias);

  form = this.fb.group({
    asignatura:['', Validators.required],
    nota:['', [Validators.required, Validators.min(0), Validators.max(5)]],
    creditos:[{value:'', disabled:true}]
  });

  constructor(
    private fb: FormBuilder,
    private firestore: FirestoreService,
    private auth: Auth,
    private router: Router
  ){}

  seleccionarMateria(){
    const materia = this.form.value.asignatura!;
    const creditos = this.materias[materia];
    this.form.patchValue({ creditos: creditos });
  }

  guardar(){
    if(this.form.invalid) return;

    const user = this.auth.currentUser;
    if(!user) return;

    const asignatura = this.form.value.asignatura!;
    const creditos = this.materias[asignatura];

    const registro = {
      uid: user.uid,
      displayName: user.displayName || '',
      email: user.email || '',
      asignatura: asignatura,
      nota: Number(this.form.value.nota),
      creditos: creditos,
      createdAt: new Date()
    };

    this.firestore.guardarRegistro(registro).then(()=>{
      alert("Asignatura registrada correctamente");
      this.router.navigate(['/dashboard']);
    });
  }

  cancelar(){
    this.router.navigate(['/dashboard']);
  }

}