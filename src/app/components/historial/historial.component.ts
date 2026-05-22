import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Auth } from '@angular/fire/auth';

import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent implements OnInit {

  registros: any[] = [];

  constructor(
    private firestore: FirestoreService,
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit() {

    const user = this.auth.currentUser;

    if (!user) return;

    this.firestore.obtenerRegistros(user.uid)
      .subscribe(data => {

        this.registros = data;

      });

  }

  volverInicio() {

    this.router.navigate(['/dashboard']);

  }

}